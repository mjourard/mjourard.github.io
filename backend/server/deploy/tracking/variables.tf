variable "unique_deployment_id" {
  description = "(Optional) An identifier tied to a deployment that makes this module create unique instances across deployments. An example would be $STAGE-$REGION-$DEVELOPER"
  type        = string
  validation {
    condition     = can(regex("^[0-9A-Za-z_-]+$", var.unique_deployment_id))
    error_message = "Unsupported character in unique deployment identifier. Must match ^[0-9A-Za-z_-]+$."
  }
}
