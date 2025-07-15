package temporalactiviy

import (
	"authentication-service/internal/db"
	"authentication-service/internal/model"
	"authentication-service/internal/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CheckUserEmailExists(ctx context.Context, input model.CheckIfUserEmail) (bool, error) {
	users, err := utils.GetAllUsers()
	if err != nil {
		log.Println("Error fetching users:", err)
		return false, err
	}

	log.Println("Checking emails:", input.CurrentUserEmail, input.Email)
	if input.CurrentUserEmail == input.Email {
		return false, errors.New("cannot invite yourself")
	}

	emailExists := false
	for _, user := range users {
		if user.Traits.Email == input.Email {
			emailExists = true
			break
		}
	}
	if !emailExists {
		log.Println("Email not found:", input.Email)
		return false, errors.New("email does not exist in system")
	}

	return true, nil
}

func GetOrganizationInfo(orgID primitive.ObjectID) (model.Org, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	organizationCollection := db.GetCollection("casbin", "organizations")

	var org model.Org

	err := organizationCollection.FindOne(ctx, bson.M{"_id": orgID}).Decode(&org)
	if err != nil {
		return model.Org{}, err
	}
	return org, nil
}

func SendOrganizationInviteNotification(input model.SendNotificationInput) error {
	url := "https://api.novu.co/v1/events/trigger"

	payload := map[string]interface{}{
		"name": "organization-invite",
		"to": map[string]string{
			"subscriberId": input.Email,
		},
		"payload": map[string]string{
			"organization":   input.OrgName,
			"organizationId": input.OrgID,
		},
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "ApiKey "+os.Getenv("API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("failed to send notification, status: %d", resp.StatusCode)
	}

	return nil
}
