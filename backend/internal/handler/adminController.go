package handler

import (
	"authentication-service/internal/utils"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func AdminDashboard(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {

		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		users, err := utils.GetAllUsers()
		if err != nil {
			log.Println("Error fetching users:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}
		for i, user := range users {
			roles := enforcer.GetRolesForUserInDomain(user.ID, "org:global")

			if len(roles) > 0 {
				users[i].Traits.Role = roles[0]
				log.Println(user, roles[0])
			} else {
				users[i].Traits.Role = "reader"
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"users":   users,
			"current": user,
		})
	}
}
