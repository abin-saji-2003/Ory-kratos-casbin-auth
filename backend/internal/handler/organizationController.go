package handler

import (
	"authentication-service/internal/db"
	"authentication-service/internal/middleware"
	"authentication-service/internal/model"
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateOrganizationHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input model.CreateOrganizationInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userData, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		user, ok := userData.(middleware.Identity)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}

		org := model.Organization{
			ID:        primitive.NewObjectID(),
			Name:      input.OrganizationName,
			Bio:       input.Bio,
			OwnerID:   user.ID,
			Email:     user.Traits.Email,
			CreatedAt: time.Now(),
		}

		collection := db.GetCollection("casbin", "organizations")
		_, err := collection.InsertOne(context.TODO(), org)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
			return
		}

		orgID := org.ID.Hex()
		domain := "org:" + orgID

		policies := [][]string{
			// Admin policies
			{"admin", domain, "/organization/list", "GET"},
			{"admin", domain, "/organization/:orgId/invite", "POST"},
			{"admin", domain, "/organization/accept", "GET"},
			{"admin", domain, "/organization/:orgId/user/:userId/role", "PUT"},

			// Writer policies
			{"writer", domain, "/organization/list", "GET"},
			{"writer", domain, "/organization/:orgId/invite", "POST"},
			{"writer", domain, "/organization/accept", "GET"},

			// Reader policies
			{"reader", domain, "/organization/list", "GET"},
			{"reader", domain, "/organization/accept", "GET"},
		}

		for _, p := range policies {
			if exists, _ := enforcer.HasPolicy(p[0], p[1], p[2], p[3]); !exists {
				added, err := enforcer.AddPolicy(p[0], p[1], p[2], p[3])
				if err != nil {
					log.Printf("❌ Failed to add policy %v: %v", p, err)
				} else if added {
					log.Println("✅ Policy added:", p)
				}
			} else {
				log.Println("⏩ Policy already exists:", p)
				continue
			}
		}

		// Save all policies
		if err := enforcer.SavePolicy(); err != nil {
			log.Println("❌ Failed to save policies to MongoDB:", err)
		}

		// Assign admin role to the user
		_, err = enforcer.AddGroupingPolicy(user.ID, "admin", domain)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign admin role"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Organization created", "organization": org})
	}
}

func GetOrganizationsForUserHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		userData, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		user, ok := userData.(middleware.Identity)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}

		groupings, err := enforcer.GetFilteredGroupingPolicy(0, user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user roles"})
			return
		}

		orgRoleMap := make(map[string]string)
		for _, g := range groupings {
			if len(g) >= 3 && strings.HasPrefix(g[2], "org:") {
				orgID := strings.TrimPrefix(g[2], "org:")
				role := g[1]
				orgRoleMap[orgID] = role
			}
		}

		log.Println(orgRoleMap)

		if len(orgRoleMap) == 0 {
			c.JSON(http.StatusOK, gin.H{"organizations": []model.Organization{}})
			return
		}

		orgIDs := make([]string, 0, len(orgRoleMap))
		for id := range orgRoleMap {
			orgIDs = append(orgIDs, id)
		}

		collection := db.GetCollection("casbin", "organizations")
		filter := bson.M{"_id": bson.M{"$in": ToObjectIDs(orgIDs)}}

		cursor, err := collection.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organization documents"})
			return
		}
		defer cursor.Close(context.TODO())

		var organizations []model.Organization
		if err := cursor.All(context.TODO(), &organizations); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode organization data"})
			return
		}

		for i, org := range organizations {
			orgID := org.ID.Hex()
			if role, exists := orgRoleMap[orgID]; exists {
				organizations[i].CurrentUserRole = role
			}
		}

		c.JSON(http.StatusOK, gin.H{"organizations": organizations})
	}
}

func ToObjectIDs(ids []string) []primitive.ObjectID {
	var objIDs []primitive.ObjectID
	for _, id := range ids {
		if oid, err := primitive.ObjectIDFromHex(id); err == nil {
			objIDs = append(objIDs, oid)
		}
	}
	return objIDs
}

func UpdateUserRoleHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.EditUserRoleRequest
		if err := c.ShouldBindJSON(&req); err != nil || req.UserRole == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		orgID := c.Param("orgId")
		userID := c.Param("userId")

		if req.UserRole != "admin" && req.UserRole != "writer" && req.UserRole != "reader" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role specified"})
			return
		}

		orgObjectID, err := primitive.ObjectIDFromHex(orgID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
			return
		}

		filter := bson.M{
			"_id":      orgObjectID,
			"users.id": userID,
		}
		update := bson.M{
			"$set": bson.M{
				"users.$.role": req.UserRole,
			},
		}

		result, err := db.GetCollection("casbin", "organizations").UpdateOne(context.TODO(), filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role in organization"})
			return
		}
		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User or organization not found"})
			return
		}

		oldPolicies, _ := enforcer.GetFilteredGroupingPolicy(0, userID, "", "org:"+orgID)
		for _, policy := range oldPolicies {
			enforcer.RemoveGroupingPolicy(policy)
		}

		_, err = enforcer.AddGroupingPolicy(userID, req.UserRole, "org:"+orgID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Casbin role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
	}
}

func GetOrganizationsForAdminHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		userData, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		user, ok := userData.(middleware.Identity)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}

		groupings, err := enforcer.GetFilteredGroupingPolicy(0, user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user roles"})
			return
		}

		orgRoleMap := make(map[string]string)
		for _, g := range groupings {
			if len(g) >= 3 && strings.HasPrefix(g[2], "org:") {
				orgID := strings.TrimPrefix(g[2], "org:")
				role := g[1]
				if role != "admin" {
					continue
				}
				orgRoleMap[orgID] = role
			}
		}

		if len(orgRoleMap) == 0 {
			c.JSON(http.StatusOK, gin.H{"organizations": []model.Organization{}})
			return
		}

		orgIDs := make([]string, 0, len(orgRoleMap))
		for id := range orgRoleMap {

			orgIDs = append(orgIDs, id)
		}

		collection := db.GetCollection("casbin", "organizations")
		filter := bson.M{
			"_id":     bson.M{"$in": ToObjectIDs(orgIDs)},
			"ownerId": user.ID,
		}

		cursor, err := collection.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organization documents"})
			return
		}
		defer cursor.Close(context.TODO())

		var organizations []model.Organization
		if err := cursor.All(context.TODO(), &organizations); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode organization data"})
			return
		}

		for i, org := range organizations {
			orgID := org.ID.Hex()
			if role, exists := orgRoleMap[orgID]; exists {
				organizations[i].CurrentUserRole = role
			}
		}

		c.JSON(http.StatusOK, gin.H{"organizations": organizations})
	}
}
