---
title: "Terraforming Our Infrastructure - Part 4"
tags: Terraform IaC AWS Tooling
series_name: terraforming-our-infrastructure
---

Our use of Terraform has continued to mature, and we are going to launch our microservice into production in the coming weeks. 
Here are some additional lessons we've learned, as well as some pain points and how we moved past them.

## Not implementing best practices for Terraform Backends lead to pain

While developing the infrastructure for our microservice, we recognized the need to be able to save Terraform state somewhere that wasn't a local file.
It was a hard requirement since we used Bitbucket for our CI/CD pipeline, and there isn't a good way to ensure files are kept around across pipeline invocations that didn't have plenty of trade offs.

We settled on S3 as a backend since it didn't come with any additional licensing or billing concerns, and we were already on AWS anyway.
From what I've read, best practices for the S3 backend is to have a separate AWS account in which the Terraform infrastructure for managing state is stored.
You would ideally also launch your state infrastructure in a different region from which your primary infrastructure exists, and have multi-region replication setup.
This would enable you to migrate your application infrastructure in the event your primary application region goes down as well as if the region your state infrastructure is in goes down as well.

That's a great setup to have and one I hope we get to eventually. 
My reality however, was that I was an intermediate developer that had no history of work in system administration or operations.
The gold standard of Terraform backend state management mentioned earlier would be an entirely new way for infrastructure management to be done for the company.

I did not have the experience with Terraform or the political pull at the company to push for my ideal solution, so I settled for a system which got us what we needed for development and should work for production redundancy.
At first, we had a hard-coded `backend.tf` file that looked like this:
```terraform
terraform {
  backend "s3" {
    bucket         = "tf-state-stuff-<internal_id>"
    key            = "microservice_name.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-state-locks-<internal_id>"
  }
}
```

This worked fine while we were flushing out how to work with Terraform and integrate it into our pipelines. 
We had a single folder for our Terraform files, and the infrastructure pieces for our backend were split into different modules within that folder based on purpose. 
For example, the primary data store, which needed to be able to launch one of three different SaaS products, was its own module that we'd control via root variables that were set via environment variables controlled in the Bitbucket repository.

We enabled different developers to work on their own infrastructure at the same time by utilizing workspaces. 
A workspace name would consist of the stage we're deploying to, the region we're deploying in and the developer or entity that was deploying the infrastructure. 
In theory, this meant that every developer on their team could launch their own infrastructure so that they'd have their own independently running version of the microservice available to test with an experiment on. 
As long as we were cognizant to include those unique identifiers in the properties that had unique requirements of the infrastructure itself, such as with S3 bucket names, it worked well.

When it came time to discuss deploying to production with dev ops, they wanted to create a backend configuration per AWS region that the microservice was to be deployed in.
The backend configurations were also to exist in the production account, since that account is heavily locked down and the state files themselves contain plain text secrets.
The backend configuration infrastructure was also to be launched via CloudFormation, which made sense since dev ops was familiar with CloudFormation stacks.  

This meant our hard-coded `backend.tf` was no longer going to work. 
In a Terraform configuration, you can only have one backend configuration and variables cannot be used in a backend block.
The solution we came up with was when Terraform was being initialized in our pipelines with the `terraform init` command, we'd pass in the backend values.

The command ended up looking something like this:
```
terraform init \
-backend-config='bucket=$BUCKET' \
-backend-config='key=microservice_name.tfstate' \
-backend-config='region=$AWS_DEFAULT_REGION' \
-backend-config='dynamodb_table=$TABLE'
```
and before this command, we'd be using the AWS cli to query the CloudFormation stacks for the relevant bucket and table names.
It works well enough for deploying to production.

The final structure of our backend configuration in the git repo ended moving the `backend.tf` file to `backend.tf.dist` and adding an entry of `backend.tf` to our `.gitignore` file.
Now when devs need to manage their own infrastructure, they copy the `backend.tf.dist` file into a local `backend.tf` file and run `terraform init` like normal.

Overall I'm pretty happy with the current setup.
It might make sense to eventually have multiple hard coded backends checked into the repo once we gain confidence in how we're managing production state.
For now, we'll wait and see.

## Underestimated the complexity of the dev environment I had setup for my teammates

It's easy to lose sight of how complicated your development environment is getting if you're not getting regular feedback from other developers.
It's also important to 

## Using Terraform as a tool to learn new infrastructure 

## tl;dr

* terraform handles different line endings very well when they are contained within `.tfvars` files
* don't stick your state management resources in the same place as your application infrastructure if you're trying to be region fault-tolerant
* don't use **AWS:us-east-1** if you can avoid it
* loosely couple your unique identifiers from within your module to your root module

Terraform is great.
I'm looking forward to making a part 3!
