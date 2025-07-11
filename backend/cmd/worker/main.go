package main

import (
	"authentication-service/internal/temporal"
)

func main() {
	temporal.StartWorker()
}
