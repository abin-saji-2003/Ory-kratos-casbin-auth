package middleware

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

type Identity struct {
	ID     string `json:"id"`
	Traits struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"traits"`
}

func RequireSessionAndMaybeAuthorize(enforcer *casbin.Enforcer, obj string, act string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie("ory_kratos_session")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing session cookie"})
			return
		}

		req, err := http.NewRequest("GET", "http://localhost:4433/sessions/whoami", nil)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}
		req.Header.Set("Cookie", "ory_kratos_session="+cookie.Value)

		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil || res.StatusCode != 200 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			return
		}
		defer res.Body.Close()

		var session struct {
			Identity Identity `json:"identity"`
		}
		if err := json.NewDecoder(res.Body).Decode(&session); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode session"})
			return
		}

		userID := session.Identity.ID

		var role string = "none"
		if enforcer != nil {
			roles, err := enforcer.GetRolesForUser(userID)
			if err != nil {
				log.Println("Failed to get role from enforcer:", err)
			} else if len(roles) > 0 {
				role = roles[0]
			}
		}

		session.Identity.Traits.Role = role

		c.Set("user", session.Identity)

		if obj != "" && act != "" && enforcer != nil {
			ok, err := enforcer.Enforce(userID, obj, act)
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Authorization error"})
				return
			}
			if !ok {
				log.Println("problem here", userID)
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied"})
				return
			}
		}

		c.Next()
	}
}
