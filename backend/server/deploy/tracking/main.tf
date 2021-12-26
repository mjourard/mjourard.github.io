terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

locals {
  table_name = join("-", ["user-tracking-info", var.unique_deployment_id])
}

resource "aws_dynamodb_table" "user-tracking-table" {
  name         = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "HashedUserID"
  range_key    = "LoadUnixTimestamp"
  attribute {
    name = "HashedUserID"
    type = "S"
  }
  attribute {
    name = "LoadUnixTimestamp"
    type = "N"
  }
  ttl {
    attribute_name = "TimeToExist"
    enabled        = false
  }
}
