package handler

import (
	"authentication-service/internal/model"
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func RegisterHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var body model.RegistrationRequest
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		flowRes, err := http.Get("http://localhost:4433/self-service/registration/api")
		if err != nil || flowRes.StatusCode != http.StatusOK {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start registration flow"})
			return
		}
		defer flowRes.Body.Close()

		var flowData map[string]interface{}
		if err := json.NewDecoder(flowRes.Body).Decode(&flowData); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode flow data"})
			return
		}
		flowId := flowData["id"].(string)

		regData := map[string]interface{}{
			"method":   "password",
			"password": body.Password,
			"traits": map[string]interface{}{
				"email": body.Email,
				"name":  body.Name,
			},
		}

		jsonData, _ := json.Marshal(regData)

		kratosRes, err := http.Post(
			"http://localhost:4433/self-service/registration?flow="+flowId,
			"application/json",
			bytes.NewReader(jsonData),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}
		defer kratosRes.Body.Close()

		bodyBytes, _ := io.ReadAll(kratosRes.Body)
		if kratosRes.StatusCode != http.StatusOK {
			var errResp map[string]interface{}
			if err := json.Unmarshal(bodyBytes, &errResp); err == nil {
				if errorText, ok := errResp["error"].(map[string]interface{}); ok {
					if message, ok := errorText["message"].(string); ok &&
						(message == "identity already exists" ||
							message == "A user with this email address already exists.") {
						c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
						log.Println("email exist")
						return
					}
				}
			}

			c.Data(kratosRes.StatusCode, "application/json", bodyBytes)
			return
		}

		var kratosResponse struct {
			Identity struct {
				ID     string `json:"id"`
				Traits struct {
					Email string `json:"email"`
					Name  string `json:"name"`
				} `json:"traits"`
			} `json:"identity"`
		}

		if err := json.Unmarshal(bodyBytes, &kratosResponse); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse registration response"})
			return
		}

		userID := kratosResponse.Identity.ID

		if err := AssignRoleToUser(enforcer, userID, "reader"); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
			return
		}

		log.Println("Registered user ID:", userID)

		c.JSON(http.StatusOK, gin.H{
			"message": "User registered successfully",
			"userId":  userID,
		})
	}
}
