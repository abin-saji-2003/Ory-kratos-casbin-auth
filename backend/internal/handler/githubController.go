package handler

import (
	"authentication-service/internal/model"
	temporalworkflow "authentication-service/internal/temporal-workflow"
	"context"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.temporal.io/sdk/client"
)

func GetGitHubRepoHandler(c *gin.Context) {
	token, err := c.Cookie("github_token")
	if err != nil || token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Missing GitHub token",
		})
		return
	}
	req, err := http.NewRequest("GET", "https://api.github.com/user/repos", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create request",
		})
		return
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github+json")

	client := http.Client{}
	resp, err := client.Do(req)

	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch repos",
		})
		return
	}

	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	c.Data(http.StatusOK, "application/json", body)
}

func CreateRepoHandler(c *gin.Context) {
	token, err := c.Cookie("github_token")
	if err != nil || token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing GitHub token"})
		return
	}

	var req model.CreateRepoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	temporalClient, err := client.Dial(client.Options{
		HostPort: "localhost:7233",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to connect to Temporal"})
		return
	}
	defer temporalClient.Close()

	input := model.CreateRepoInput{
		GitHubToken: token,
		Name:        req.Name,
		Description: req.Description,
		Private:     req.Private,
	}

	we, err := temporalClient.ExecuteWorkflow(context.Background(), client.StartWorkflowOptions{
		ID:        "create-repo-" + uuid.New().String(),
		TaskQueue: "GITHUB_TASK_QUEUE",
	}, temporalworkflow.CreateGitHubRepoWorkflow, input)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var repoURL string
	err = we.Get(context.Background(), &repoURL)

	if err != nil {
		log.Fatalln("Unable get workflow result", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "created",
		"url":    repoURL,
	})
}
