terraform {
  required_version = ">= 1.0.11"
  required_providers {
    google = ">= 3.3"
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.38.0"
    }
  }
}

provider "google" {
  project = "eminent-monitor-332923"
}

provider "aws" {
  default_tags {
    tags = {
      Environment = var.stage
      Owner       = "Ops"
      Managed     = "Terraform"
    }
  }
}