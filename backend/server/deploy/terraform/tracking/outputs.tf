output "tracking_table_name" {
  value = aws_dynamodb_table.user-tracking-table.name
}

output "ssm_tracking_table_variable" {
  value = aws_ssm_parameter.table-name.name
}
