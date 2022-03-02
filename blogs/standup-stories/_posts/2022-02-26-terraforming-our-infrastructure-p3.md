---
title: "Terraforming Our Infrastructure - Part 3"
tags: Terraform IaC AWS Tooling
series_name: terraforming-our-infrastructure
---

Our use of Terraform within our organization has continued to mature, and we are going to launch our microservice into production in the coming weeks. 
Here are some additional lessons we've learned, as well as some pain points and how we moved past them.

## Compromises Can Be Necessary When Advocating For New Processes

As I mentioned in [part 2](/blogs/standup-stories/2021/12/09/terraforming-our-infrastructure-p2), we were storing our Terraform state files in S3 in us-east-1.
From what I've read, best practices for the S3 backend is to have a separate AWS account in which the Terraform infrastructure for managing state is stored.
You would ideally also launch your state infrastructure in a different region from which your primary infrastructure exists, and have multi-region replication setup for your Terraform state infrastructure.
This would enable you to migrate your application infrastructure in the event your primary application region goes down as well as if the region your state infrastructure is in goes down as well.

That's a great setup to have and one I hope we get to eventually. 
My reality however, was that I did not have the experience with Terraform to justify asking for this.
The request would have gone through Cloud Ops and likely Finance, and this being the first project we were using Terraform with, it was entirely possible that we'd have to rip out and abandon Terraform before it starts making us any money.
With this in mind, we collaborated with Cloud Ops to come up with the following system that met our needs for development and production redundancy: 

The old hard-coded `backend.tf` file was moved to be a `backend.tf.dist` file and then `backend.tf` was ignored in the `.gitignore` file.
When pulling the repo, devs would run `cp backend.tf.dist backend.tf` to create their local backend copy for Terraform.
From there, devs would continue working like normal. 
Any dev environments controlled via CI/CD would simply execute the `cp` command above before initializing Terraform.

For production environments, we added the `-backend-config` flags to calls to `Terraform init` and the values were variables pulled from CloudFormation describe-stack calls.
There's an S3 Bucket and Dynamo Table in every region we deploy to so that deployments do not have an additional regional dependency on them.
This setup seems to work well in testing and for deploying to our staging environments.

For reference, here's what the `backend.tf.dist` file that looks like:
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

The `terraform init` command ended up looking something like this:
```
terraform init \
-backend-config='bucket=$BUCKET' \
-backend-config='key=microservice_name.tfstate' \
-backend-config='region=$AWS_DEFAULT_REGION' \
-backend-config='dynamodb_table=$TABLE'
```

Overall I'm pretty happy with the current setup.
It might make sense to eventually have multiple hard coded backends checked into the repo once we gain confidence in how we're managing production state.
For now, we'll wait and see.

## Orphaned Infrastructure Was Actually Part Of Misnamed Workspace

When I was setting up the development tools for our project, I was very selfish. 
I optimized it for quick feedback loops, since I didn't know Terraform all that well myself.
All developer infrastructure had to be controlled from a developer's machine as opposed to through a pipeline. 
I required our environments to have three different environment variables ($STAGE, $AWS_REGION and $DEVELOPER) which were shared between the Serverless Framework and Terraform.
They would dictate what region you deployed to, what workspace your infrastructure was saved in, and influenced most of the unique names required of the infrastructure itself.

However, it was not that simple. I had unknowingly created a few GOTCHAs.

GOTCHA #1: We had a `env.tfvars` file in the repo which contained Terraform variable versions of the environment variables I listed above. 
They had to be in sync with the environment variables, otherwise infrastructure names would not match the workspace they were a part of, or infrastructure could be deployed to the wrong region.
Also, there was no automated mechanism for keeping them in sync - *devs were responsible for that*.

GOTCHA #2: Devs had to remember to switch their Terraform workspaces after updating their environment variables and env.tfvar files.
They could do this either manually or with an npm script command: `npm run tf:workspace:select`.
Again, there was no automated mechanism for doing this once a change of their environment variables was detected.

GOTCHA #3: The Terraform workspace was not a tag on the infrastructure.
This is less a gotcha for everybody else and more a gotcha for me, since it made tracking down what workspace some infrastructure was deployed to more annoying than it should have been.

The three issues above combined to cause one of the devs to deploy their infrastructure with the environment variable values of 

* STAGE=stage_1
* AWS_REGION=region_1
* DEVELOPER=dev_1

but their workspace used the values of:

* STAGE=stage_3
* AWS_REGION=region_6
* DEVELOPER=dev_1

which made it very difficult to further update their infrastructure after they had temporarily switched workspaces to a different stage and then tried to switch back.

It took a minute to determine what happened, after which we were able to track down the workspace they had used with a quick aws cli command:
```
aws s3api list-objects --bucket $TF_STATE_BUCKET --query '*[].[Key,Size]'
``` 

Any workspace that was empty was 155 bytes, and thankfully they only had two active workspaces. 
The orphaned infrastructure was tracked down and destroyed, and normal work for the dev was restored.

These gotchas and the above issue would have been avoided had I either created custom Bitbucket pipelines for setting up developer infrastructure or wrote additional scripts to ensure everything there stayed in sync.
Given the complexity of the latter, additional pipelines is definitely the way to go. 
I'll also be adding the Terraform workspace name to the default tags in the AWS provider, as dev environments can be volatile even if they are controlled via CI/CD.

A lesson I'll be taking away from this is to remember that there will be two classes of teammates/colleagues/devs that you will need to support when adopting a new technology into your normal development workflow.
The classes are the developers with the capacity to become intimately familiar with the new tool, and those without. 
If it's a tool for developers, then all devs will be capable of learning how to use it and how it works.
That being said, any number of other commitments might be higher on their personal list of TODOs than learning the tool.
They are still going to need to know how to use the tool in order to increase their productivity past what they were doing before the new tool was introduced.

For the class of devs that will become intimately familiar with the tool, value *flexibility*.
For the class of devs that won't, value *simplicity*.
Unless the ratio of familiar to unfamiliar devs is heavily skewed towards the familiar, you should favour tooling implementations that create simple workflows.
This is because the familiar devs can _eventually contribute_ the flexibility features that are missing, while the unfamiliar devs likely cannot help simplify the workflows.
And as with all things in development, the above guidelines should be taken with a few grains of salt since every team and tool is different.

## tl;dr

* compromising on Terraform backend best-practices in order to move the company forward with our use of Terraform 
* add your Terraform workspace to the default aws tags in your AWS provider if you've got a volatile list of workspaces 
* keep your tooling workflows simple when trying to gain buy-in for adopting a new technology - you will get help to create additional tooling if you first gain buy-in. 


With that, part 3 is done. 
Since we are deploying to production shortly, I'll try to include a part 4 to describe the aftermath of the deployment.
Fingers crossed the article is a simple "It went well, no incidents and the service is humming along.".

The service itself has at least two more major iterations ahead of it planned out by management. 
I'll aim to write a part 5 of this series, which will function as a postmortem of the deployments and initial production run.
I'm sure there will be lessons to learn, and I look forward to them. 
