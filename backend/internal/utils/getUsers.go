package utils

import (
	"authentication-service/internal/model"
	"encoding/json"
	"net/http"
)

func GetAllUsers() ([]model.Identity, error) {
	req, err := http.NewRequest("GET", "http://localhost:4434/identities", nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil || res.StatusCode != http.StatusOK {
		return nil, err
	}
	defer res.Body.Close()

	var users []model.Identity
	if err := json.NewDecoder(res.Body).Decode(&users); err != nil {
		return nil, err
	}

	return users, nil
}
