package handler

import (
	"authentication-service/internal/model"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func AssignRoleToUser(enforcer *casbin.Enforcer, userID string, role string) error {
	existingRoles, err := enforcer.GetRolesForUser(userID)
	if err != nil {
		return err
	}

	if len(existingRoles) > 0 {
		log.Printf("User %s already has role %v , skipping assignment.\n", userID, existingRoles)
		return nil
	}

	ok, err := enforcer.AddGroupingPolicy(userID, role, "org:global")
	if err != nil {
		return err
	}
	if ok {
		log.Printf("Assigned role '%s' to user %s\n", role, userID)
	} else {
		log.Printf("User %s already has role '%s'\n", userID, role)
	}

	if err := enforcer.SavePolicy(); err != nil {
		return err
	}

	return nil
}

func EditUserHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.EditUserRoleRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadGateway, gin.H{
				"error": "invalid input",
			})
		}
		log.Println(req.UserRole)

		userID := c.Param("id")

		if err := EditUserRole(enforcer, userID, req.UserRole, "org:global"); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to edit role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "succuss",
			"message": "User role edited succesfully successfully",
		})
	}
}

func EditUserRole(enforcer *casbin.Enforcer, userID, newRole, dom string) error {
	existingRoles, err := enforcer.GetRolesForUser(userID, dom)
	if err != nil {
		return err
	}

	for _, role := range existingRoles {
		_, err := enforcer.RemoveGroupingPolicy(userID, role, dom)

		if err != nil {
			return err
		}
	}

	ok, err := enforcer.AddGroupingPolicy(userID, newRole, dom)
	if err != nil {
		return err
	}

	if ok {
		log.Printf("Assigned new role '%s' to user %s\n", newRole, userID)
	} else {
		log.Printf("User %s already has role '%s'\n", userID, newRole)
	}

	if err := enforcer.SavePolicy(); err != nil {
		return err
	}

	return nil
}

func UserRoleHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.UserRoleRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadGateway, gin.H{
				"error": "invalid input",
			})
		}

		if err := AssignRoleToUser(enforcer, req.UserId, req.UserRole); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to edit role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "succuss",
			"message": "User role edited succesfully successfully",
		})
	}
}
