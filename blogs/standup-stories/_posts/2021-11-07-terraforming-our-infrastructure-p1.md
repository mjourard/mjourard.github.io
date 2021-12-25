---
title: "Terraforming Our Infrastructure - Part 1"
tags: Terraform IaC AWS Tooling
series_name: terraforming-our-infrastructure
---

Being able to deploy your infrastructure in a consistent, repeatable way is an essential practice for any modern tech company.
This is easily accomplished using infrastructure-as-code (IaC) tools, in which you map your infrastructure to resources defined in templates. 
The templates are then fed into the IaC tool, which then spins up the infrastructure in whatever cloud environment the tool is built for.

The industry standard for cross-cloud deployments is to use [Terraform](https://www.terraform.io) by Hashicorp.
Straight from the horse's mouth:
> Terraform is an open-source infrastructure as code software tool that provides a consistent CLI workflow to manage hundreds of cloud services. Terraform codifies cloud APIs into declarative configuration files.

At work, we were entirely in AWS and exclusively used [CloudFormation](https://aws.amazon.com/cloudformation/), amazon's native IaC tool. 
After some mergers and acquisitions, we'll potentially be deploying to multiple different cloud providers, as well as leveraging new SaaS offerings.
knowing this, we were given the green light to start using Terraform.

In this article series, I'll be documenting my thoughts and lessons learned when working with Terraform. 
For part 1, I'll include the road map of what I had to learn first as well as some "best practices" that I've determined worked for my team and I.
Take the "best practices" with several grains of salt since I'm literally starting from scratch.

## How To Think About Terraform

Terraform uses a declarative language in which you define the structure of your deployments in templates and Terraform takes care of how to stand up those resources.

I'd first like to go over some important high-level features that make it stand out over CloudFormation, allowing for much cleaner templates:
* Able to declare and use [local variables](https://www.terraform.io/docs/language/values/locals.html)
* Built-in [functions](https://www.terraform.io/docs/language/functions/index.html) allow for value transformation 
* Template [inputs](https://www.terraform.io/docs/language/values/variables.html) can be supplied via environment variable, command line input or via interactive CLI as opposed to just via command line input.
* Terraform automatically concatenates all `*.tf` files in a directory together to form one template, making for easy separation of concerns.
* Different cloud providers and SaaS offerings have their own modules (called providers) making Terraform extremely extendable. 
  * You can expect any popular SaaS offering or cloud platform to have a terraform provider, though the quality and support of those providers are not guaranteed.  
* Subdirectories define **modules**, which have their own sets of inputs, local variables, providers and outputs. This will be further expanded upon later.
* Terraform manages infrastructure it has deployed through something called **state**
  * Terraform can also import existing resources into the managed state

These features enable a Terraform developer to apply standard good software development practices to produce clean and reusable terraform templates.

## State and Workspaces

A quick note on state: whenever you run Terraform, it will keep track of the resources it has created in a 'state file'. 
These resources then become managed by Terraform and if you update their values in your template, Terraform will know to update the existing resource instead of creating a new one with the updated value. 
As such, these state files are extremely important. 
By default, these state files are created and stored locally on disk, in the directory in which the root Terraform template exists.

One issue we quickly ran into is what happens when two users make updates to the template at the same time?
Or how would we use Terraform in a CI/CD environment where files don't persist between pipeline executions?
The answer was through Terraform [Backends](https://www.terraform.io/docs/language/settings/backends/index.html).
With these configured, Terraform will automatically save the state file in some remote file store instead of locally.

Since we were an AWS shop, the [S3 Backend](https://www.terraform.io/docs/language/settings/backends/s3.html) was the obvious choice.
Looking online, I found a recommended standard to keep your terraform state S3 buckets in a totally separate account (usually with elevated privileges), and then have all other AWS accounts have their infrastructure entirely controlled via Terraform.
If you're interested in that, [here's an article with instructions](https://www.padok.fr/en/blog/terraform-s3-bucket-aws). 
Since we're new to Terraform and getting cross-account permissions requires cutting through some red tape at work, we took the simple approach of creating an S3 bucket + DynamoDB table in the account that we were deploying infrastructure in.
No issues so far in the few weeks we've been ramping up on it.

The next thing we ran into is how does state get handled when deploying through different environments?
This is handled via [workspaces](https://www.terraform.io/docs/language/state/workspaces.html) and is effortless to use.
With the S3 backend that we chose, the workspace name becomes part of the S3 object's key, so it's easy to think about. 


## Current Terraform Goals

It was important for me to set out some goals for myself while I was still learning Terraform.
The projects that I write in Terraform should aim to be:
* **configurable**: they can be deployed to multiple different environments at the same time
* **runnable**: between teammates and CI/CD pipelines
* **output**: useful information for other devs and QA engineers
* **usable submodules**: smaller sections of infrastructure should be divided up into modules that can be re-used in other projects 

I feel that configurable is obvious enough.

To expand on runnable, I meant that I wanted my templates to be deployable from any developer's laptop as long as they had sufficient credentials. 
Those same templates should also be deployable from a CI/CD pipeline. 
This goal is easy enough to accomplish through a STAGE input variable and combining it with certain resource values (typically the name).

As for outputting useful information, there will be different "stages" that Terraform will deploy to. 
To save my teammates time and some headaches, the templates should output relevant information such as S3 bucket names, DNS names, etc. that can then be output at the end of either a manual run or the CI/CD pipeline.

Here's some standards that we've come up with to try to reach these goals.

## Current Standards

We've come up with some standards on how to write and manage Terraform templates in the short time we've been using it.
My hope is someone else will see these standards and their reasonings, and use them to get a jump-start on their own Terraform projects.

### Version Control

With any IaC tool, you should be checking your templates into version control and managing changes that way.
In addition to the templates, you should also check in the `.terraform.lock.hcl` file, as it keeps track of your Terraform and provider versions.

You should not check in the state files (`terraform.tfstate` and `terraform.tfstate.backup`) unless you are using version control to manage state as well.
Use one place to store state files and don't leave red-herrings for other developers. 

### Project Structure

Since Terraform will automatically concatenate `.tf` files together, we can designate different files for different needs within our modules.
Most modules will use some combination of input variables and providers while providing some outputs. 

We dedicate individual files for each of those entities to make finding them easier: `variables.tf`, `providers.tf` and `outputs.tf`.
The files that declare the resources to be created and managed can really be named anything, so we'll keep it simple with `main.tf`.
Lastly, for our main terraform module we will also store our backend configuration in a file called `backend.tf` to keep consistent with distinct file purposes.
Our main Terraform module then looks like this:
```
.
├── backend.tf
├── main.tf
├── outputs.tf
├── providers.tf
└── variables.tf
```

#### variables.tf

For a good starting piece of standards, I'll refer to and endorse this article here: 
[Terraform Variables - A Standard](https://lachlanwhite.com/posts/terraform/10-11-2021-terraform-variables-a-standard/).    
The benefits have been apparent whenever I returned to working on our Terraform templates.

> **_Note:_** When it comes to [Variable Definitions Files](https://www.terraform.io/docs/language/values/variables.html), I'll openly admit that I ignored their use case when I was first learning how to use Terraform.
> Instead, we went with the hacky `.env` file style that I define below since it's a pattern that we knew and recognized.
> It effectively functions the same as the Variable Definition Files, but requires some additional scripting as is therefore worse. 
> For my next Terraform projects, I'll likely go with Variable Definitions files and supply a `terraform.tfvars.dist` file in the repo.

One other standard that I've been toying with was making the variables use the same naming standard as environments variables; **ALL_CAPS_SNAKE_CASE**.
Reason being that the primary way we launch our templates is to define our Terraform variable values in `.env` files using the `TF_VAR_<variable_name>` syntax and then loading that file in as environment variables.
This makes it much quicker to iterate on Terraform templates.

The command to load in .env files as environment variables: `export $(grep -v '^#' .env | xargs)`.

There's also been a decent amount of reuse between the environment variables we need to pass our application code and the environment variables we need for launching Terraform.
Terraform would need API keys, client ids or other potential configuration values such as AWS_REGION for the providers being used. 
Our applications would need those same values to be able to call the APIs at runtime. 
It makes it easier to script loading those values from a single source of truth if I only need to concatenate `TF_VAR_` to an existing environment variable instead of potentially having to jump through hoops in different shell environments.

This script works to copy over the environment variables but the function might not work for all shell environments:
```shell
#!/usr/bin/env bash
function copy_to_terraform() {
  TF_VAR="TF_VAR_"$(echo $1 | tr '[:upper:]' '[:lower:]')
  ENV_VALUE=$(eval "echo \"\$$1\"")
  export $TF_VAR=$ENV_VALUE
}

copy_to_terraform 'API_KEY'
copy_to_terraform 'OTHER_SECRET'
```

Now at the start of each CI/CD pipeline phase that works with terraform, that script is ran to copy over the Terraform values we need from a single source of truth. 


#### providers.tf
Terraform mentions that module requirements for providers should state a range of allowed versions of the provider.
While this is good idea to promote, I've not found a good, non-tedious way to look back on available versions of providers to determine the minimum version. 

For now, we're going with the standard of asking for the latest version of the current major version, and let the SEMVER standard take care of it.

## Enabling/Disabling Modules

One benefit to Terraform is the ability to be able to use different providers to accomplish the same task.
A prime example would be to be able to switch between an **Amazon CloudFront** distribution and a **Cloudflare CDN** as a way to serve content efficiently from an **Amazon S3** bucket.
You might prefer Cloudflare over CloudFront for a better pricing model, but need to switch to CloudFront temporarily because Cloudflare is sending back errors and it's out of your hands.

In order to accomplish this, you can set the `count` attribute of each `module` that you're importing. 
If you set the `count` to 0, via some input variable, then that module will not be used.

Here's an example:
```terraform
variable "ACTIVE_CDN" {
    description = <<EOF
        (Optional)  Pass in which CDN will be used in front of our S3 bucket. 
                    Must be one of ['cloudfront','cloudflare'].
    EOF
    type        = string
    default     = "cloudfront"
    validation {
        condition = contains(["cloudfront","cloudflare"], var.ACTIVE_CDN)
        error_message = "The active CDN must be one of the supported values: cloudfront or cloudflare
    }  
}

module "cloudfront_cdn" {
    count = var.USE_CLOUDFRONT == "cloudfront" ? 1 : 0
    source = "./cloudfront"
    ...
}

module "cloudflare_cdn" {
    count = var.USE_CLOUDFLARE == "cloudflare" ? 1 : 0
    source = "./cloudflare"
    ...
}
```

Just note that whenever you use the `count` attribute on an entity, it then becomes a list of that entity whenever you reference it in your templates, including for outputs.
It can make the output formatting a little ugly but you can also get around that by using the `join` function.

## To Be Worked Out

We're new to Terraform as an organization, so we're still working through some details. 
For one, we're not too sure on how to share custom modules internally. 

Terraform has built-in support for sharing modules remotely.
They've obviously got their proprietary Terraform Registry, but that costs money so we aren't jumping up and down about that yet.
The [Generic Git Registry](https://www.terraform.io/docs/language/modules/sources.html#generic-git-repository) looks the most promising since it also supports private git repos. 
To be determined.

The other thing to work out is automated tests - how do we know that our changes worked or will work?
Terraform has `terraform fmt -check` and `terraform validate` that we've included in our CI/CD pipelines but there's probably more we could do.
Hashicorp released a [blog post about testing](https://www.hashicorp.com/blog/testing-hashicorp-terraform) that is worth reviewing.

Overall, our initial experience with Terraform has been fantastic.
I'll be writing followup articles as our usage matures.
