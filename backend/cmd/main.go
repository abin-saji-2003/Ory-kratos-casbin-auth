package main

import (
	"authentication-service/internal/db"
	"authentication-service/internal/routes"
	"log"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"

	//fileadapter "github.com/casbin/casbin/v2/persist/file-adapter"
	mongodbadapter "github.com/casbin/mongodb-adapter/v3"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not loaded")
	} else {
		log.Println(".env file loaded successfully")
	}
}

func main() {
	db.ConnectMongoDB("mongodb://localhost:27017")

	m, err := model.NewModelFromFile("rbac_model.conf")
	if err != nil {
		log.Fatalf("Failed to load Casbin model: %v", err)
	}
	//a := fileadapter.NewAdapter("policy.csv")
	adapter, err := mongodbadapter.NewAdapter("mongodb://localhost:27017/casbin")
	if err != nil {
		log.Fatalf("Failed to create MongoDB adapter: %v", err)
	}

	enforcer, err := casbin.NewEnforcer(m, adapter)
	if err != nil {
		log.Fatalf("Failed to create Casbin enforcer: %v", err)
	}

	enforcer.EnableAutoSave(true)

	if err := enforcer.LoadPolicy(); err != nil {
		log.Fatalf("Failed to load Casbin policy: %v", err)
	}

	config := cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1:3000", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router := gin.Default()
	router.Use(cors.New(config))

	routes.RegisterRoutes(router, enforcer)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
