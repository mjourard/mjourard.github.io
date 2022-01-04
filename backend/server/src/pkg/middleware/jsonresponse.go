package middleware

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
)

const (
	HeaderContentTypeHTTP2 = "content-type"
	JsonContentType        = "application/json"
)

// JsonResponse sets cors headers on each request for the configured origins
func JsonResponse(f HandlerFunc) HandlerFunc {
	return func(ctx context.Context, r events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

		response, err := f(ctx, r)
		if err != nil {
			// don't set the json headers on a response that errored out
			return response, err
		}
		if response.Headers == nil {
			response.Headers = map[string]string{}
		}
		if val, ok := response.Headers[HeaderContentTypeHTTP2]; ok {
			if val != JsonContentType {
				response.Headers[HeaderContentTypeHTTP2] = JsonContentType
			}
		} else {
			response.Headers[HeaderContentTypeHTTP2] = JsonContentType
		}
		return response, err
	}
}

//how to use:
//func main() {
//	lambda.Start(JsonResponse(handle))
//}
