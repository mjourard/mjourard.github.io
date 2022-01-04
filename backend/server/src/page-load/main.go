package main

import (
	"bytes"
	"context"
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/mjourard/tracking/pkg"
	"github.com/mjourard/tracking/pkg/api"
	"github.com/mjourard/tracking/pkg/api/tracking"
	"github.com/mjourard/tracking/pkg/middleware"
	"github.com/mjourard/tracking/pkg/util"
	"os"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration

// Handler is our lambda handler invoked by the `lambda.Start` function call
func Handler(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	myLogger := api.StandardLambdaLogger(ctx, pkg.EnvLogLevel)
	parser := tracking.NewParser(myLogger)
	pageLoad := parser.GetPageLoadFromAPIGatewayEvent(event)
	dynamodb := util.GetDynamoClient(myLogger)
	tracker := tracking.New(dynamodb, os.Getenv(pkg.EnvTrackingTableName), myLogger)
	success := tracker.AddPageLoad(pageLoad)
	if !success && !pkg.IsUserFacing() {
		var buf bytes.Buffer
		body, err := json.Marshal(map[string]interface{}{
			"message": "There was a problem while adding the user tracking information. Check the logs for more information.",
		})
		if err != nil {
			myLogger.Errorf("There was an error while trying to json.Marshal the response: %v", err)
			return events.APIGatewayProxyResponse{StatusCode: 404}, err
		}
		json.HTMLEscape(&buf, body)
		return events.APIGatewayProxyResponse{
			StatusCode:      400,
			IsBase64Encoded: false,
			Body:            buf.String(),
			Headers: map[string]string{
				"Content-Type": "application/json",
			},
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode:      204,
		IsBase64Encoded: false,
		//This needs to resolve to a JSON-decodable string
		Body: "{}",
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}, nil
}

func main() {
	lambda.Start(
		middleware.Logging(
			middleware.Cors(
				middleware.JsonResponse(
					Handler,
				),
			),
		),
	)
}
