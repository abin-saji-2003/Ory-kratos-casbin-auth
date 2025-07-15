package handler

import (
	"authentication-service/internal/db"
	"authentication-service/internal/middleware"
	"authentication-service/internal/model"
	temporalworkflow "authentication-service/internal/temporal-workflow"
	"errors"

	"context"
	"net/http"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/temporal"
)

func InviteUserToOrganization(c *gin.Context) {
	var req model.InviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orgID := c.Param("orgId")

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	identity, ok := user.(middleware.Identity)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type in context"})
		return
	}

	email := identity.Traits.Email

	objectID, err := primitive.ObjectIDFromHex(orgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	temporalClient, err := client.Dial(client.Options{
		HostPort: "localhost:7233",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to connect to Temporal"})
		return
	}
	defer temporalClient.Close()

	input := model.SendNotification{
		Email:            req.Email,
		OrgId:            orgID,
		ObjectID:         objectID,
		CurrentUserEmail: email,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	workflowRun, err := temporalClient.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:        "send-notification-" + uuid.New().String(),
		TaskQueue: "NOVU_TASK_QUEUE",
	}, temporalworkflow.SendNotificationWorkflow, input)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start workflow: " + err.Error()})
		return
	}

	var result interface{}
	err = workflowRun.Get(ctx, &result)
	if err != nil {
		var appErr *temporal.ApplicationError
		if errors.As(err, &appErr) {
			c.JSON(http.StatusBadRequest, gin.H{"error": appErr.Message()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invitation sent successfully"})
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

		_, err = enforcer.AddGroupingPolicy(user.ID, "reader", "org:"+orgID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Joined organization successfully"})
	}
}
