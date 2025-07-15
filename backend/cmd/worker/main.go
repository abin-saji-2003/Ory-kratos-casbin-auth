package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"authentication-service/internal/db"
	temporalactiviy "authentication-service/internal/temporal-activiy"
	temporalworkflow "authentication-service/internal/temporal-workflow"

	"github.com/joho/godotenv"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
	db.ConnectMongoDB("mongodb://localhost:27017")
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not loaded")
	} else {
		log.Println(".env file loaded successfully")
	}

	c, err := client.Dial(client.Options{
		HostPort: "localhost:7233",
	})
	if err != nil {
		log.Fatalf("Unable to connect to Temporal: %v", err)
	}
	defer c.Close()

	w1 := worker.New(c, "GITHUB_TASK_QUEUE", worker.Options{})
	w1.RegisterWorkflow(temporalworkflow.CreateGitHubRepoWorkflow)
	w1.RegisterActivity(temporalactiviy.CreateGithubRepoActivity)

	w2 := worker.New(c, "NOVU_TASK_QUEUE", worker.Options{})
	w2.RegisterWorkflow(temporalworkflow.SendNotificationWorkflow)
	w2.RegisterActivity(temporalactiviy.CheckUserEmailExists)
	w2.RegisterActivity(temporalactiviy.GetOrganizationInfo)
	w2.RegisterActivity(temporalactiviy.SendOrganizationInviteNotification)

	if err := w1.Start(); err != nil {
		log.Fatalf("Failed to start GitHub worker: %v", err)
	}
	if err := w2.Start(); err != nil {
		log.Fatalf("Failed to start Notification worker: %v", err)
	}

	log.Println("Temporal workers are running")

	// shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("Shutting down Temporal workers...")
	w1.Stop()
	w2.Stop()
}
