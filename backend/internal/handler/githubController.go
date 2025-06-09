package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
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
