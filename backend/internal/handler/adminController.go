package handler

import (
	"authentication-service/internal/model"
	"encoding/json"
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

		users, err := GetAllUsers()
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

func GetAllUsers() ([]model.Identity, error) {
	req, err := http.NewRequest("GET", "http://localhost:4434/identities", nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil || res.StatusCode != http.StatusOK {
		return nil, err
	}
	defer res.Body.Close()

	var users []model.Identity
	if err := json.NewDecoder(res.Body).Decode(&users); err != nil {
		return nil, err
	}

	return users, nil
}
