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

	// Create enforcer
	e, err := casbin.NewEnforcer(m, adapter)
	if err != nil {
		log.Fatalf("Failed to create enforcer: %v", err)
	}

	e.EnableAutoSave(true)

	// Seed policies
	policies := [][]string{
		{"admin", "/admin/dashboard", "GET"},
		{"admin", "/github/repo/create", "POST"},
		{"admin", "/github/repos", "GET"},
		{"admin", "/logout", "POST"},
		{"admin", "/home", "GET"},
		{"admin", "/admin/users/:id/role", "PUT"},
		{"writer", "/github/repo/create", "POST"},
		{"writer", "/github/repos", "GET"},
		{"writer", "/home", "GET"},
		{"writer", "/logout", "GET"},
		{"reader", "/github/repos", "GET"},
		{"reader", "/home", "GET"},
		{"reader", "/logout", "GET"},
	}

	groupPolicies := [][]string{
		{"f415848e-038b-4d30-aa59-e4fa17db8c69", "admin"},
	}

	for _, p := range policies {
		added, _ := e.AddPolicy(p[0], p[1], p[2])
		if added {
			fmt.Println("✅ Policy added:", p)
		}
	}

	for _, g := range groupPolicies {
		added, _ := e.AddGroupingPolicy(g[0], g[1])
		if added {
			fmt.Println("✅ Grouping added:", g)
		}
	}
}
