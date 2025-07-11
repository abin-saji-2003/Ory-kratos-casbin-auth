package temporal

import (
	temporalworkflow "authentication-service/internal/temporal-workflow"
	"log"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func StartWorker() {
	c, err := client.Dial(client.Options{
		HostPort: "localhost:7233",
	})
	if err != nil {
		log.Fatalf("Unable to connect to Temporal: %v", err)
	}

	defer c.Close()

	w := worker.New(c, "GITHUB_TASK_QUEUE", worker.Options{})

	w.RegisterWorkflow(temporalworkflow.CreateGitHubRepoWorkflow)
	w.RegisterActivity(temporalworkflow.CreateGithubRepoActivity)

	log.Println("Temporal Worker is running...")

	if err := w.Run(worker.InterruptCh()); err != nil {
		log.Fatalf("Unable to start worker: %v", err)
	}
}
