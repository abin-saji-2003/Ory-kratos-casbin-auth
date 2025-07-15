package routes

import (
	"authentication-service/internal/handler"
	"authentication-service/internal/middleware"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, enforcer *casbin.Enforcer) {

	// Public routes
	r.POST("/register", handler.RegisterHandler(enforcer))
	r.POST("/logout", handler.LogoutHandler)
	r.GET("/github/login", handler.GitHubLoginHandler)
	r.GET("/github/callback", handler.GitHubCallBackHandler)
	r.POST("/assign-role", handler.UserRoleHandler(enforcer))

	// Global protected routes
	r.GET("/home", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/home", "GET", false), handler.HomePage)
	r.GET("/admin/dashboard", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/admin/dashboard", "GET", false), handler.AdminDashboard(enforcer))
	r.POST("/github/repo/create", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/github/repo/create", "POST", false), handler.CreateRepoHandler)
	r.PUT("/admin/users/:id/role", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/admin/users/:id/role", "PUT", false), handler.EditUserHandler(enforcer))
	r.GET("/github/repos", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/github/repos", "GET", false), handler.GetGitHubRepoHandler)

	// Organization-specific protected routes
	r.POST("/organization/create", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/create", "POST", false), handler.CreateOrganizationHandler(enforcer))
	r.GET("/organization/list", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/list", "GET", false), handler.GetOrganizationsForUserHandler(enforcer))
	r.GET("/organization/user/list", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/list", "GET", false), handler.GetOrganizationsForAdminHandler(enforcer))

	r.POST("/organization/:orgId/accept", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/:orgId/accept", "POST", false), handler.AcceptOrganizationInvite(enforcer))
	r.POST("/organization/:orgId/invite", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/:orgId/invite", "POST", true), handler.InviteUserToOrganization)
	r.PUT("/organization/:orgId/user/:userId/role", middleware.RequireSessionAndMaybeAuthorize(enforcer, "/organization/:orgId/user/:userId/role", "PUT", true), handler.UpdateUserRoleHandler(enforcer))
}
