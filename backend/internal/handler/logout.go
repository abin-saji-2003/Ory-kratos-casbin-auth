package handler

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func LogoutHandler(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	c.SetCookie(
		"github_token",
		"",
		-1,
		"/",
		os.Getenv("HOST"),
		false,
		true,
	)

	client := &http.Client{}
	req, err := http.NewRequest("GET", os.Getenv("KRATOS_PUBLIC_URL")+"/self-service/logout/browser", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create logout request"})
		return
	}

	for _, cookie := range c.Request.Cookies() {
		req.AddCookie(cookie)
	}

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to contact Kratos"})
		return
	}
	defer resp.Body.Close()

	var respData struct {
		LogoutURL string `json:"logout_url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode Kratos response"})
		return
	}

	if respData.LogoutURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Logout URL not returned by Kratos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logout_url": respData.LogoutURL,
	})
}
