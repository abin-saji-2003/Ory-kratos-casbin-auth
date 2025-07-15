package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateRepoRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description,omitempty"`
	Private     bool   `json:"private"`
}

type RegistrationRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type Identity struct {
	ID       string `json:"id"`
	SchemaID string `json:"schema_id"`
	Traits   struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"traits"`
}

type UserRoleRequest struct {
	UserId   string `json:"userId"`
	UserRole string `json:"role"`
}

type EditUserRoleRequest struct {
	UserRole string `json:"new_role"`
}

type CreateOrganizationInput struct {
	OrganizationName string `json:"organizationName" binding:"required"`
	Bio              string `json:"bio"`
}

type OrgUser struct {
	UserID   string    `bson:"id" json:"id"`
	Email    string    `bson:"email" json:"email"`
	Name     string    `bson:"name" json:"name,omitempty"`
	Role     string    `bson:"role" json:"role"`
	JoinedAt time.Time `bson:"joinedAt" json:"joinedAt"`
}

type Organization struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name            string             `bson:"name" json:"name"`
	Bio             string             `bson:"bio" json:"bio"`
	OwnerID         string             `bson:"ownerId" json:"ownerId"`
	CurrentUserRole string             `bson:"role" json:"role"`
	Email           string             `bson:"email" json:"email"`
	CreatedAt       time.Time          `bson:"createdAt" json:"createdAt"`
	Users           []OrgUser          `bson:"users,omitempty" json:"users,omitempty"`
}

type OrganizationInvite struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrgID      string             `bson:"orgId" json:"orgId"`
	Email      string             `bson:"email" json:"email"`
	InvitedBy  string             `bson:"invitedBy" json:"invitedBy"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
	AcceptedBy string             `bson:"acceptedBy,omitempty" json:"acceptedBy,omitempty"`
	AcceptedAt *time.Time         `bson:"acceptedAt,omitempty" json:"acceptedAt,omitempty"`
}

type InviteRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type SendNotification struct {
	Email            string
	OrgId            string
	ObjectID         primitive.ObjectID
	CurrentUserEmail string
}

type CreateRepoInput struct {
	GitHubToken string
	Name        string
	Description string
	Private     bool
}

type Org struct {
	Name string `bson:"name"`
}

type SendNotificationInput struct {
	Email   string
	OrgName string
	OrgID   string
}

type CheckIfUserEmail struct {
	Email            string
	CurrentUserEmail string
}
