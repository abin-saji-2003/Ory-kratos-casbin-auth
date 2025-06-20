package handler

import (
	//"authentication-service/internal/middleware"
	"encoding/json"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

type Identity struct {
	ID       string `json:"id"`
	SchemaID string `json:"schema_id"`
	Traits   struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"traits"`
}

func AdminDashboard(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {

		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}
		req, err := http.NewRequest("GET", "http://localhost:4434/identities", nil)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}

		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil || res.StatusCode != 200 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Failed to fetch the users"})
			return
		}

		defer res.Body.Close()

		var users []Identity

		if err := json.NewDecoder(res.Body).Decode(&users); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse the users"})
			return
		}

		for i, user := range users {
			roles, err := enforcer.GetRolesForUser(user.ID)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to get role for user " + user.ID,
				})
				return
			}

			if len(roles) != 1 {
				users[i].Traits.Role = "reader"
			} else {
				users[i].Traits.Role = roles[0]
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"users":   users,
			"current": user,
		})
	}
}
