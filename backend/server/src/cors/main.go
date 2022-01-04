package main

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/mjourard/tracking/pkg/middleware"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration

// Handler is our lambda handler invoked by the `lambda.Start` function call
func Handler(ctx context.Context, r events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            "{}",
	}, nil
}

func main() {
	lambda.Start(middleware.Logging(
		middleware.Cors(
			middleware.JsonResponse(
				Handler,
			),
		),
	))
}
