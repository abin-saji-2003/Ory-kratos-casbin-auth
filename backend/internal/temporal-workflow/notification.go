package temporalworkflow

import (
	"authentication-service/internal/model"
	temporalactiviy "authentication-service/internal/temporal-activiy"
	"errors"
	"log"
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func SendNotificationWorkflow(ctx workflow.Context, input model.SendNotification) error {
	retryOptions := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second * 2,
			BackoffCoefficient: 2.0,
			MaximumAttempts:    5,
		},
	}
	noRetryOptions := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			MaximumAttempts: 1,
		},
	}
	ctx1 := workflow.WithActivityOptions(ctx, noRetryOptions)

	checkIfUserEmail := model.CheckIfUserEmail{
		Email:            input.Email,
		CurrentUserEmail: input.CurrentUserEmail,
	}

	var emailExists bool
	err := workflow.ExecuteActivity(ctx1, temporalactiviy.CheckUserEmailExists, checkIfUserEmail).Get(ctx1, &emailExists)
	if err != nil {
		log.Println("error is here")
		return err
	}
	if !emailExists {
		return errors.New("email check failed: email not found or self-invite")
	}

	var org model.Org

	err = workflow.ExecuteActivity(ctx1, temporalactiviy.GetOrganizationInfo, input.ObjectID).Get(ctx1, &org)
	if err != nil {
		return err
	}

	ctx2 := workflow.WithActivityOptions(ctx, retryOptions)
	sendNotificationInput := model.SendNotificationInput{
		Email:   input.Email,
		OrgName: org.Name,
		OrgID:   input.OrgId,
	}

	err = workflow.ExecuteActivity(ctx2, temporalactiviy.SendOrganizationInviteNotification, sendNotificationInput).Get(ctx2, nil)
	if err != nil {
		return err
	}
	return nil
}
