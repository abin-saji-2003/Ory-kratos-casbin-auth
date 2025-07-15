package temporalactiviy

import (
	"authentication-service/internal/model"
	"context"
	"fmt"

	"github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

func CreateGithubRepoActivity(ctx context.Context, input model.CreateRepoInput) (string, error) {
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: input.GitHubToken})
	tc := oauth2.NewClient(ctx, ts)
	client := github.NewClient(tc)

	_, _, err := client.Users.Get(ctx, "")

	if err != nil {
		return "", fmt.Errorf("GitHub token invalid: %w", err)
	}

	repo := &github.Repository{
		Name:        github.String(input.Name),
		Description: github.String(input.Description),
		Private:     github.Bool(input.Private),
	}

	createdRepo, _, err := client.Repositories.Create(ctx, "", repo)
	if err != nil {
		return "", fmt.Errorf("GitHub repo creation failed: %w", err)
	}

	return createdRepo.GetHTMLURL(), nil
}
