package middleware

import (
	"encoding/json"
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type Identity struct {
	ID     string `json:"id"`
	Traits struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"traits"`
}

func RequireSessionAndMaybeAuthorize(enforcer *casbin.Enforcer, obj, act string, useOrgDomain bool) gin.HandlerFunc {
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
		if err != nil || res.StatusCode != http.StatusOK {
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
		c.Set("user", session.Identity)

		if enforcer != nil && obj != "" && act != "" {
			var domain string
			if useOrgDomain {
				orgID := c.Param("orgId")
				if orgID == "" {
					c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Missing orgId in route"})
					return
				}
				domain = "org:" + orgID
			} else {
				domain = "org:global"
			}

			log.Println(userID, domain, obj, act)

			ok, err := enforcer.Enforce(userID, domain, obj, act)
			if err != nil {
				log.Println("Casbin enforcement error:", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Authorization failed"})
				return
			}
			if !ok {
				log.Println("problem here")
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied"})
				return
			}
		}

		c.Next()
	}
}
