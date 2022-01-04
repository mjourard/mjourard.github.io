package tracking

import (
	"crypto/md5"
	"fmt"
	"github.com/Masterminds/log-go"
	"github.com/aws/aws-lambda-go/events"
	"github.com/mjourard/tracking/pkg/models"
	"strconv"
	"strings"
	"time"
)

const (
	UnsetValue                         = "unset"
	UnsetIntegerValue            int64 = -1
	CustomHeaderSession                = "ses" //to be used later maybe
	CustomHeaderPreviousReferrer       = "prev-referrer"
	HeaderOrigin                       = "Origin"
	HeaderReferrer                     = "Referer"
	HeaderXForwardedFor                = "X-Forwarded-For"
	QueryParamWidth                    = "w"
	QueryParamHeight                   = "h"
	QueryParamPath                     = "path"
)

type Parser struct {
	logger log.Logger
}

func NewParser(logger log.Logger) *Parser {
	return &Parser{
		logger: logger,
	}
}

func (p *Parser) GetPageLoadFromAPIGatewayEvent(event events.APIGatewayProxyRequest) *models.PageLoad {
	ip := event.RequestContext.Identity.SourceIP
	ua := event.RequestContext.Identity.UserAgent
	referrer := p.getHeader(event, HeaderReferrer)
	origin := p.getHeader(event, HeaderOrigin)
	previousReferrer := p.getHeader(event, CustomHeaderPreviousReferrer)
	xForwarded := p.getHeader(event, HeaderXForwardedFor)
	width := p.getIntQueryStringParam(event, QueryParamWidth)
	height := p.getIntQueryStringParam(event, QueryParamHeight)
	path := p.getStrQueryStringParam(event, QueryParamPath)
	hashed := md5.Sum([]byte(ip + ua))
	now := time.Now()
	pageLoad := models.PageLoad{
		HashedUserID:          fmt.Sprintf("%x", hashed),
		UrlLoaded:             referrer,
		Origin:                origin,
		Path:                  path,
		Referrer:              previousReferrer,
		XForwardedFor:         xForwarded,
		ScreenWidth:           width,
		ScreenHeight:          height,
		UserAgent:             ua,
		LoadUnixTimestamp:     now.UnixMilli(),
		LoadReadableTimestamp: now.UTC(),
	}
	return &pageLoad
}

func (p *Parser) getHeader(event events.APIGatewayProxyRequest, headerName string) string {
	headerVal := UnsetValue
	if val, ok := event.Headers[headerName]; ok {
		headerVal = val
	} else if val2, ok2 := event.Headers[strings.ToLower(headerName)]; ok2 {
		headerVal = val2
	}
	return headerVal
}

func (p *Parser) getStrQueryStringParam(event events.APIGatewayProxyRequest, paramName string) string {
	queryParam := UnsetValue
	if val, ok := event.QueryStringParameters[paramName]; ok {
		queryParam = val
	}
	return queryParam
}

func (p *Parser) getIntQueryStringParam(event events.APIGatewayProxyRequest, paramName string) int64 {

	queryParam := UnsetIntegerValue
	if val, ok := event.QueryStringParameters[paramName]; ok {
		if i, err := strconv.ParseInt(val, 10, 64); err == nil {
			queryParam = i
		} else {
			p.logger.Warnw("Unable to convert query string parameter to integer", log.Fields{
				"param": QueryParamWidth,
				"value": val,
				"error": err,
			})
		}
	}
	return queryParam
}
