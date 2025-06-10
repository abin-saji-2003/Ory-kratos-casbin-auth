package main

import (
	"authentication-service/internal/routes"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env file not loaded")
	} else {
		log.Println(".env file loaded successfully")
	}
}

func main() {
	config := cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:3000", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router := gin.Default()
	router.Use(cors.New(config))
	routes.RegisterRoutes(router)

	router.Run(":8080")
}
