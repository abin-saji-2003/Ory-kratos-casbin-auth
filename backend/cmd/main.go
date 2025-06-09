package main

import (
	"authentication-service/internal/handler"
	"authentication-service/internal/middleware"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not loaded")
	} else {
		log.Println("✅ .env file loaded successfully")
	}
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/home", middleware.RequireKratosSession(), handler.HomePage)
	router.GET("/github/login", handler.GitHubLoginHandler)
	router.GET("/github/callback", handler.GitHubCallBackHandler)
	router.GET("/github/repos", handler.GetGitHubRepoHandler)

	router.Run(":8080")
}
