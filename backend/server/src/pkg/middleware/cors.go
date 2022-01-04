package middleware

import (
	"context"
	"github.com/Masterminds/log-go"
	"github.com/aws/aws-lambda-go/events"
	"github.com/mjourard/tracking/pkg"
	"github.com/mjourard/tracking/pkg/api"
	"os"
	"strings"
)

const (
	AllowCredentials = "access-control-allow-credentials"
	AllowHeaders     = "access-control-allow-headers"
	AllowMethods     = "access-control-allow-methods"
	AllowOrigin      = "access-control-allow-origin"
	ExposeHeaders    = "access-control-expose-headers"
)

var allowedHeaders = []string{
	"Content-Type",
	"Accept-Encoding",
	"X-Bearer-Token",
	"X-Amz-Date",
	"Authorization",
	"X-Api-Key",
	"X-Amz-Security-Token",
	"X-Amz-User-Agent",
	"Accept-Language",
	"Expires",
	"ses",
	"Prev-Referrer",
	"Referer",
	"X-Forwarded-For",
}
var allowedMethods = []string{"GET", "POST", "OPTIONS", "DELETE"}

func normalizeOrigin(origin string) string {
	if len(origin) == 0 {
		return origin
	}
	origin = strings.TrimSpace(origin)
	origin = strings.ToLower(origin)
	return origin
}

func getAllowedOrigins(envkey string) []string {
	allowedOriginsStr := ""
	if val, ok := os.LookupEnv(envkey); ok {
		allowedOriginsStr = val
	}
	origins := strings.Split(allowedOriginsStr, ",")
	for idx, allowedOrigin := range origins {
		origins[idx] = normalizeOrigin(allowedOrigin)
	}
	return origins
}

func getAllowedHeadersStr(funcAllowedHeaders []string) string {
	temp := make([]string, 0)
	for _, header := range funcAllowedHeaders {
		temp = append(temp, header)
		lower := strings.ToLower(header)
		if header != lower {
			temp = append(temp, lower)
		}
	}
	return strings.Join(temp, ",")
}

// Cors sets cors headers on each request for the configured origins
func Cors(f HandlerFunc) HandlerFunc {
	return func(ctx context.Context, r events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		logger := api.StandardLambdaLogger(ctx, pkg.EnvLogLevel)
		origin := ""
		if val, ok := r.Headers["Origin"]; ok {
			origin = val
		} else if val2, ok2 := r.Headers["origin"]; ok2 {
			origin = val2
		}
		logger.Debugw("Found origin value...", log.Fields{
			"origin": origin,
		})
		response, err := f(ctx, r)
		if err != nil {
			// don't set cors headers on a response that errored out
			return response, err
		}

		if origin == "" {
			logger.Debug("Empty 'Origin' header passed in, no cors available")
			return response, err
		}
		normalizedOrigin := normalizeOrigin(origin)
		allowedOrigins := getAllowedOrigins(pkg.EnvCorsAllowedOrigins)
		allowedOrigin := ""
		for _, curOrigin := range allowedOrigins {
			if curOrigin == normalizedOrigin {
				allowedOrigin = origin
			}
		}
		if allowedOrigin == "" {
			// don't set cors headers if the origin was not an allowed one
			logger.Warnw("Unidentified origin attempting to call the api", log.Fields{
				"origin": origin,
			})
			return response, err
		}
		if _, ok := response.Headers[AllowCredentials]; !ok {
			response.Headers[AllowCredentials] = "true"
		}
		finalAllowedHeaders := getAllowedHeadersStr(allowedHeaders)
		if _, ok := response.Headers[AllowHeaders]; !ok {
			response.Headers[AllowHeaders] = finalAllowedHeaders
			logger.Debugw("Recording allowed headers...", log.Fields{
				"allowedHeaders": finalAllowedHeaders,
			})
		}
		if _, ok := response.Headers[AllowMethods]; !ok {
			response.Headers[AllowMethods] = strings.Join(allowedMethods, ",")
		}
		if _, ok := response.Headers[AllowOrigin]; !ok {
			response.Headers[AllowOrigin] = allowedOrigin
		}
		if _, ok := response.Headers[ExposeHeaders]; !ok {
			response.Headers[ExposeHeaders] = finalAllowedHeaders
		}

		return response, err
	}
}

//how to use:
//func main() {
//	lambda.Start(Cors(handle))
//}
