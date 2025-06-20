package model

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

type UserRoleRequest struct {
	UserId   string `json:"userId"`
	UserRole string `json:"role"`
}

type EditUserRoleRequest struct {
	UserRole string `json:"new_role"`
}
