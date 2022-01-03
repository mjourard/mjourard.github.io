package middleware

import (
	"context"
	"github.com/Masterminds/log-go"
	"github.com/aws/aws-lambda-go/events"
	"github.com/mjourard/tracking/pkg"
	"github.com/mjourard/tracking/pkg/api"
)

var headersToLog = [...]string{"Referer", "X-Forwarded-For"}

type HandlerFunc func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)

// Logging the extra set of instructions
// things to be done before running the business logic
func Logging(f HandlerFunc) HandlerFunc {
	return func(ctx context.Context, r events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		logger := api.StandardLambdaLogger(ctx, pkg.EnvLogLevel)
		headerMap := map[string]string{}
		for _, header := range headersToLog {
			if val, ok := r.Headers[header]; ok {
				headerMap[header] = val
			} else {
				headerMap[header] = "no-header-found"
			}
		}
		logger.Infow("request handling started...", log.Fields{
			"url":     r.Path,
			"method":  r.RequestContext.HTTPMethod,
			"headers": headerMap,
		})
		response, err := f(ctx, r)
		didError := err != nil
		logger.Infow("sending response...", log.Fields{
			"status":                 response.StatusCode,
			"handler_returned_error": didError,
		})
		return response, err
	}
}

//how to use:
//func main() {
//	lambda.Start(logging(handle))
//}
