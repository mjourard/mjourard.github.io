package api

import (
	"context"
	"fmt"
	_ "github.com/Masterminds/log-go"
	mmlogrus "github.com/Masterminds/log-go/impl/logrus"
	"github.com/aws/aws-lambda-go/lambdacontext"
	"github.com/sirupsen/logrus"
	"os"
	"time"
)

var standardLogger *mmlogrus.Logger = nil

type loggerWithFields struct {
	defaultFields map[string]string
	formatter     logrus.Formatter
}

func (l loggerWithFields) Format(entry *logrus.Entry) ([]byte, error) {
	for key, value := range l.defaultFields {
		entry.Data[key] = value
	}
	return l.formatter.Format(entry)
}

func StandardLambdaLogger(ctx context.Context, logLevelEnvVarName string) *mmlogrus.Logger {
	if standardLogger == nil {
		lc, _ := lambdacontext.FromContext(ctx)
		logger := logrus.New()
		logger.SetOutput(os.Stdout)
		//leave this as false since it is just adding the file that logrus is being called from, which is somewhere in Masterminds/log-go
		logger.SetReportCaller(false)
		logger.SetFormatter(loggerWithFields{
			defaultFields: map[string]string{
				"request_id": lc.AwsRequestID,
			},
			formatter: &logrus.JSONFormatter{
				TimestampFormat:   time.RFC3339,
				DisableTimestamp:  false,
				DisableHTMLEscape: false,
				DataKey:           "",
				FieldMap:          nil,
				CallerPrettyfier:  nil,
				PrettyPrint:       false,
			},
		})
		level := logrus.InfoLevel
		if envLevel := os.Getenv(logLevelEnvVarName); envLevel != "" {
			temp, err := logrus.ParseLevel(envLevel)
			if err != nil {
				panic(fmt.Sprintf("Unable to initialize standard logger - error while parsing the level set as an environment variable (%s), err: %v", envLevel, err))
			}
			level = temp
		}
		logger.SetLevel(level)
		standardLogger = mmlogrus.New(logger)
	}
	return standardLogger
}
