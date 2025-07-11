package temporalworkflow

import (
	"authentication-service/internal/model"
	"context"
	"fmt"
	"time"

	"github.com/google/go-github/github"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
	"golang.org/x/oauth2"
)

func CreateGitHubRepoWorkflow(ctx workflow.Context, input model.CreateRepoInput) (string, error) {
	options := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second * 2,
			BackoffCoefficient: 2.0,
			MaximumAttempts:    5,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, options)

	var repoURL string
	err := workflow.ExecuteActivity(ctx, CreateGithubRepoActivity, input).Get(ctx, &repoURL)

	if err != nil {
		return "", err
	}

	return repoURL, nil
}

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
