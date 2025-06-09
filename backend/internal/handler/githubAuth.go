package handler

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

func GitHubLoginHandler(c *gin.Context) {
	clientID := os.Getenv("GITHUB_CLIENT_ID")
	redirectURL := "http://localhost:8080/github/callback"
	c.Redirect(http.StatusFound, fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s",
		clientID,
		redirectURL,
	))
}

func GitHubCallBackHandler(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing code in callback",
		})
		return
	}
	tokenRes, err := http.PostForm("https://github.com/login/oauth/access_token", url.Values{
		"client_id":     {os.Getenv("GITHUB_CLIENT_ID")},
		"client_secret": {os.Getenv("GITHUB_CLIENT_SECRET")},
		"code":          {code},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Token exchange failed",
		})
		return
	}

	defer tokenRes.Body.Close()
	body, _ := io.ReadAll(tokenRes.Body)

	values, _ := url.ParseQuery(string(body))
	token := values.Get("access_token")
	if token == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid token response"})
		return
	}

	c.SetCookie(
		"github_token",
		token,
		3600,
		"/",
		os.Getenv("HOST"),
		false,
		true,
	)
	c.Redirect(http.StatusFound, "http://localhost:3000")
}
