package handler

import (
	"authentication-service/internal/model"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
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

	var repoReq model.CreateRepoRequest
	if err := c.ShouldBindJSON(&repoReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ctx := context.Background()
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	_, _, err = client.Users.Get(ctx, "")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":  "Invalid or expired GitHub token",
			"detail": "Token may be invalid, expired, or missing required scopes",
		})
		return
	}

	repo := &github.Repository{
		Name:        github.String(repoReq.Name),
		Description: github.String(repoReq.Description),
		Private:     github.Bool(repoReq.Private),
	}

	createdRepo, _, err := client.Repositories.Create(ctx, "", repo)
	if err != nil {
		log.Println(1)
		// More detailed error handling
		var errorMsg string
		if ghErr, ok := err.(*github.ErrorResponse); ok {
			errorMsg = fmt.Sprintf("GitHub API error: %s (Status: %d)", ghErr.Message, ghErr.Response.StatusCode)
			log.Println(errorMsg)
			if ghErr.Response.StatusCode == 401 || ghErr.Response.StatusCode == 403 {
				errorMsg += ". Please ensure your token has the 'repo' scope."
			}
		} else {
			errorMsg = err.Error()
			log.Println(errorMsg)
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":    errorMsg,
			"solution": "Ensure your GitHub token has the 'repo' scope and is not expired",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"repo":   createdRepo.Name,
		"url":    createdRepo.GetHTMLURL(),
	})
}
