variable "unique_deployment_id" {
    description = "(Optional) An identifier tied to a deployment that makes this module create unique instances across deployments. An example would be $STAGE-$REGION-$DEVELOPER"
    type        = string
    validation {
        condition     = regexmatch(["dev", "test", "stage", "production"], var.stage)
        error_message = "Unsupported selected stage. Must be one of 'dev', 'stage', 'test', 'production'."
    }
}
