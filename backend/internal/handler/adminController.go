package handler

import (
	"authentication-service/internal/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminDashboard(c *gin.Context) {
	// Get the user from context (set by your RequireKratosSession middleware)
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	// Type assert to Identity struct
	user, ok := userInterface.(middleware.Identity)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type in context"})
		return
	}

	// Check if user has admin role
	if user.Traits.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied: admin privileges required",
			"role":  user.Traits.Role,
		})
		return
	}

	// User is admin - grant access
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"user":    user,
		"message": "Welcome to admin dashboard",
	})
}
