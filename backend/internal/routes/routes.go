package routes

import (
	"authentication-service/internal/handler"
	"authentication-service/internal/middleware"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, enforcer *casbin.Enforcer) {
	// Public routes
	r.GET("/github/login", handler.GitHubLoginHandler)
	r.GET("/github/callback", handler.GitHubCallBackHandler)
	r.POST("/register", handler.RegisterHandler(enforcer))
	r.POST("/logout", handler.LogoutHandler)
	r.POST("/assign-role", handler.UserRoleHandler(enforcer))

	// Protected routes with session + authorization
	r.GET("/home", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/home", "GET"), handler.HomePage)
	r.GET("/admin/dashboard", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/admin/dashboard", "GET"), handler.AdminDashboard(enforcer))
	r.POST("/github/repo/create", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/github/repo/create", "POST"), handler.CreateRepoHandler)
	r.PUT("/admin/users/:id/role", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/admin/users/:id/role", "PUT"), handler.EditUserHandler(enforcer))

	// Optional: Protect repo viewing if needed
	r.GET("/github/repos", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/github/repos", "GET"), handler.GetGitHubRepoHandler)
}
