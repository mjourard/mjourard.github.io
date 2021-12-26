data "aws_region" "cur_region" {}
data "aws_caller_identity" "cur_account" {}
data "git_repository" "tf" {
  //this setup requires terraform to be launched from the same directory that contains the .git folder
  path = path.cwd
}
