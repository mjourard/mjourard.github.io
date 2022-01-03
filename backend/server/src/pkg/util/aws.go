package util

import (
	"github.com/Masterminds/log-go"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/mjourard/tracking/pkg"
	"os"
)

type SimpleAWSLogger struct {
	log.Logger
}

func (l *SimpleAWSLogger) Log(msg ...interface{}) {
	l.Info(msg)
}

func GetDynamoClient(myLogger log.Logger) *dynamodb.DynamoDB {
	var endpoint *string
	if val, exists := os.LookupEnv(pkg.EnvAWSEndpoint); exists {
		endpoint = &val
	} else {
		endpoint = nil
	}
	simpleLogger := &SimpleAWSLogger{
		Logger: myLogger,
	}

	mySession, err := session.NewSession(&aws.Config{
		CredentialsChainVerboseErrors: aws.Bool(true),
		Endpoint:                      endpoint,
		LogLevel:                      aws.LogLevel(aws.LogDebug),
		Logger:                        simpleLogger,
	})
	if err != nil {
		simpleLogger.Panicf("Unable to create aws session: %v", err)
	}
	return dynamodb.New(mySession)
}
