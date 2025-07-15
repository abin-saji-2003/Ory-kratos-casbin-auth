package temporalworkflow

import (
	"authentication-service/internal/model"
	temporalactiviy "authentication-service/internal/temporal-activiy"
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
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
	err := workflow.ExecuteActivity(ctx, temporalactiviy.CreateGithubRepoActivity, input).Get(ctx, &repoURL)

	if err != nil {
		return "", err
	}

	return repoURL, nil
}
