package pkg

import "os"

const (
	EnvTrackingTableName = "DYNAMO_TRACKING_TABLE"
	EnvLogLevel          = "LOG_LEVEL"
	EnvAWSEndpoint       = "AWS_ENDPOINT"
	EnvStage             = "STAGE"
)

func IsUserFacing() bool {
	if val, ok := os.LookupEnv(EnvStage); ok {
		if val == "prod" {
			return true
		}
	}
	return false
}
