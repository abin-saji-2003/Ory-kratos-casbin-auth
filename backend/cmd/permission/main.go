package main

import (
	"fmt"
	"log"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	mongodbadapter "github.com/casbin/mongodb-adapter/v3"
)

func main() {
	m, err := model.NewModelFromFile("rbac_model.conf")
	if err != nil {
		log.Fatalf("Failed to load Casbin model: %v", err)
	}

	adapter, err := mongodbadapter.NewAdapter("mongodb://localhost:27017")
	if err != nil {
		log.Fatalf("MongoDB adapter error: %v", err)
	}

	e, err := casbin.NewEnforcer(m, adapter)
	if err != nil {
		log.Fatalf("Failed to create enforcer: %v", err)
	}

	e.EnableAutoSave(true)

	domain := "org:global"

	policies := [][]string{
		// Admin permissions
		{"admin", domain, "/admin/dashboard", "GET"},
		{"admin", domain, "/github/repo/create", "POST"},
		{"admin", domain, "/github/repos", "GET"},
		{"admin", domain, "/logout", "POST"},
		{"admin", domain, "/home", "GET"},
		{"admin", domain, "/admin/users/:id/role", "PUT"},
		{"admin", domain, "/organization/create", "POST"},
		{"admin", domain, "/organization/list", "GET"},
		{"admin", domain, "/organization/:orgId/accept", "POST"},

		// Writer permissions
		{"writer", domain, "/github/repo/create", "POST"},
		{"writer", domain, "/github/repos", "GET"},
		{"writer", domain, "/logout", "GET"},
		{"writer", domain, "/home", "GET"},
		{"writer", domain, "/organization/create", "POST"},
		{"writer", domain, "/organization/list", "GET"},
		{"writer", domain, "/organization/:orgId/accept", "POST"},

		// Reader permissions
		{"reader", domain, "/github/repos", "GET"},
		{"reader", domain, "/logout", "GET"},
		{"reader", domain, "/home", "GET"},
		{"reader", domain, "/organization/create", "POST"},
		{"reader", domain, "/organization/list", "GET"},
		{"reader", domain, "/organization/:orgId/accept", "POST"},
	}

	groupPolicies := [][]string{
		{"723a2bd0-4c77-4375-a74b-0a7f9858960b", "admin", domain},
	}

	for _, p := range policies {
		if ok, _ := e.HasPolicy(p[0], p[1], p[2], p[3]); !ok {
			added, err := e.AddPolicy(p[0], p[1], p[2], p[3])
			if err != nil {
				log.Printf("Error adding policy %v: %v\n", p, err)
			} else if added {
				fmt.Println("Policy added:", p)
			}
		}
	}

	for _, g := range groupPolicies {
		if ok, _ := e.HasGroupingPolicy(g[0], g[1], g[2]); !ok {
			added, err := e.AddGroupingPolicy(g[0], g[1], g[2])
			if err != nil {
				log.Printf("Grouping policy error: %v\n", err)
			} else if added {
				fmt.Println("Grouping added:", g)
			}
		}
	}

}
