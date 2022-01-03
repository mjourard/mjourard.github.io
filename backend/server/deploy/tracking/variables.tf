variable "unique_deployment_id" {
  description = "(Required) An identifier tied to a deployment that makes this module create unique instances across deployments. An example would be $STAGE-$REGION-$DEVELOPER"
  type        = string
  validation {
    condition     = can(regex("^[0-9A-Za-z_-]+$", var.unique_deployment_id))
    error_message = "Unsupported character in unique deployment identifier. Must match ^[0-9A-Za-z_-]+$."
  }
}

variable "ssm_prefix" {
  description = "(Required) a prefix to apply to the SSM parameters produced by this module."
  type        = string
  validation {
    condition     = can(regex("^/[0-9A-Za-z_-]+(/[0-9A-Za-z_-]+)*", var.ssm_prefix))
    error_message = "Unsupported character in ssm prefix. Must match ^/[0-9A-Za-z_-]+(/[0-9A-Za-z_-]+)*."
  }
}
variable "ttl_enable" {
  description = "(Optional) whether or not the dynamodb tracking table with have a TTL enabled."
  type        = bool
  default     = false
}
