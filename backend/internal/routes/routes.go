package routes

import (
	"authentication-service/internal/handler"
	"authentication-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/github/login", handler.GitHubLoginHandler)
	r.GET("/github/callback", handler.GitHubCallBackHandler)

	r.GET("/home", middleware.RequireKratosSession(), handler.HomePage)
	r.POST("/logout", middleware.RequireKratosSession(), handler.LogoutHandler)
	r.GET("/admin/dashboard", middleware.RequireKratosSession(), handler.AdminDashboard)

	r.GET("/github/repos", handler.GetGitHubRepoHandler)
}
