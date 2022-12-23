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
  ttl = (var.ttl_enable == true ? [
    {
      ttl_enable = var.ttl_enable
      ttl_attribute : "TimeToExist"
    }
  ] : [])
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
  dynamic "ttl" {
    for_each = local.ttl
    content {
      attribute_name = local.ttl[0].ttl_attribute
      enabled        = local.ttl[0].ttl_enabled
    }
  }
}

resource "aws_ssm_parameter" "table-name" {
  name  = join("/", [var.ssm_prefix, "DYNAMO_TRACKING_TABLE"])
  type  = "String"
  value = aws_dynamodb_table.user-tracking-table.name
}

resource "aws_ssm_parameter" "table-name-arn" {
  name  = join("/", [var.ssm_prefix, "DYNAMO_TRACKING_TABLE_ARN"])
  type  = "String"
  value = aws_dynamodb_table.user-tracking-table.arn
}

