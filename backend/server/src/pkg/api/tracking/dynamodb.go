package tracking

import (
	"github.com/Masterminds/log-go"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/mjourard/tracking/pkg/models"
)

type Client struct {
	dynamo    *dynamodb.DynamoDB
	tableName string
	logger    log.Logger
}

func New(dynamo *dynamodb.DynamoDB, tableName string, logger log.Logger) *Client {
	return &Client{
		dynamo:    dynamo,
		tableName: tableName,
		logger:    logger,
	}
}

func (c *Client) AddPageLoad(pl *models.PageLoad) bool {
	av, err := dynamodbattribute.MarshalMap(pl)
	if err != nil {
		c.logger.Errorf("failed DynamoDB marshal Record, %v", err)
		return false
	}
	input := &dynamodb.PutItemInput{
		Item:                   av,
		TableName:              aws.String(c.tableName),
		ReturnConsumedCapacity: aws.String(dynamodb.ReturnConsumedCapacityTotal),
	}

	result, err := c.dynamo.PutItem(input)

	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case dynamodb.ErrCodeConditionalCheckFailedException:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeConditionalCheckFailedException, aerr.Error())
			case dynamodb.ErrCodeProvisionedThroughputExceededException:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeProvisionedThroughputExceededException, aerr.Error())
			case dynamodb.ErrCodeResourceNotFoundException:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeResourceNotFoundException, aerr.Error())
			case dynamodb.ErrCodeItemCollectionSizeLimitExceededException:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeItemCollectionSizeLimitExceededException, aerr.Error())
			case dynamodb.ErrCodeTransactionConflictException:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeTransactionConflictException, aerr.Error())
			case dynamodb.ErrCodeRequestLimitExceeded:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeRequestLimitExceeded, aerr.Error())
			case dynamodb.ErrCodeInternalServerError:
				c.logger.Errorf("%s: %v", dynamodb.ErrCodeInternalServerError, aerr.Error())
			default:
				c.logger.Errorf("%s: %v", aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			c.logger.Errorf("%s: %v", err.Error())
		}
		return false
	} else {
		if result != nil && result.ConsumedCapacity != nil && result.ConsumedCapacity.WriteCapacityUnits != nil {
			c.logger.Debugf("Operation consumed %f write capacity units", *result.ConsumedCapacity.WriteCapacityUnits)
		}
		return true
	}
}
