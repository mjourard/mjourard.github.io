terraform {
  required_version = ">= 1.0.11"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.38.0"
    }
    git = {
      source  = "paultyng/git"
      version = "0.1.0"
    }
  }
}

provider "aws" {
  default_tags {
    tags = {
      Environment = var.stage
      Developer   = var.developer
      Owner       = "Ops"
      Managed     = "Terraform"
      Commit      = replace(data.git_repository.tf.branch, "/[#]+/", "_")
    }
  }
}

provider "git" {}
