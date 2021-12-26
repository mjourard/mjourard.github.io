variable "stage" {
  description = "(Optional) What stage in the deployment pipeline to deploy to."
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "test", "stage", "production"], var.stage)
    error_message = "Unsupported selected stage. Must be one of 'dev', 'stage', 'test', 'production'."
  }
}

variable "developer" {
  description = "(Required) The developer or entity that deployed this terraform state."
  type        = string
}
