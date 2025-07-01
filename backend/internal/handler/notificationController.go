package handler

import (
	"authentication-service/internal/db"
	"authentication-service/internal/middleware"
	"authentication-service/internal/model"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func InviteUserToOrganization(c *gin.Context) {
	var req model.InviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orgID := c.Param("orgId")
	objectID, err := primitive.ObjectIDFromHex(orgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	organizationCollection := db.GetCollection("casbin", "organizations")

	var org struct {
		Name string `bson:"name"`
	}

	err = organizationCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&org)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	if err := sendNovuNotification(req.Email, org.Name, orgID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invitation sent successfully"})
}

func sendNovuNotification(toEmail string, organizationName, orgID string) error {
	log.Println(orgID)
	url := "https://api.novu.co/v1/events/trigger"

	payload := map[string]interface{}{
		"name": "organization-invite",
		"to": map[string]string{
			"subscriberId": toEmail,
		},
		"payload": map[string]string{
			"organization":   organizationName,
			"organizationId": orgID,
		},
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "ApiKey 6cccdf61bd17246df912675572851b7f")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("failed to send notification, status: %d", resp.StatusCode)
	}

	return nil
}

func AcceptOrganizationInvite(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		orgID := c.Param("orgId")
		objectID, err := primitive.ObjectIDFromHex(orgID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
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

		filter := bson.M{
			"_id":         objectID,
			"users.email": user.Traits.Email,
		}
		count, err := db.GetCollection("casbin", "organizations").CountDocuments(context.TODO(), filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing users"})
			return
		}
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"message": "User already in the organization"})
			return
		}

		update := bson.M{
			"$push": bson.M{
				"users": bson.M{
					"id":       user.ID,
					"name":     user.Traits.Name,
					"email":    user.Traits.Email,
					"role":     "reader",
					"joinedAt": time.Now(),
				},
			},
		}
		result, err := db.GetCollection("casbin", "organizations").UpdateOne(context.TODO(), bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization with user"})
			return
		}
		if result.MatchedCount == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Organization not found"})
			return
		}

		// Step 3: Add Casbin grouping policy
		_, err = enforcer.AddGroupingPolicy(user.ID, "reader", "org:"+orgID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Joined organization successfully"})
	}
}
