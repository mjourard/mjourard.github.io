output "tracking_table_name" {
  value = module.tracking.tracking_table_name
}
output "tracking_table_region" {
  value = data.aws_region.cur_region.name
}
output "current_sha" {
  value = data.git_repository.tf.commit_hash
}
