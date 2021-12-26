locals {
  unique_deployment_id = format("%s-%s-%s-%s",
    var.stage,
    var.developer,
    data.aws_region.cur_region.name,
  data.aws_caller_identity.cur_account.account_id)
}

module "tracking" {
  source               = "./tracking"
  unique_deployment_id = local.unique_deployment_id
}
