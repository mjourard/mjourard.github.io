---
title: "Terraforming Our Infrastructure - Part 4 - Project Conclusion"
tags: Terraform IaC AWS Tooling Port-Mortem
series_name: terraforming-our-infrastructure
---

After six successful releases, our microservice has been used by two of our monoliths in production for a few months now.
The project has transitioned to maintenance-mode, and my team has been reassigned to implement a totally separate microservice. 
In this final article of the series, I'll be reflecting on how Terraform was utilized in the project. 
To do so, the tried and true cliche of 'The Good, The Bad, and The Ugly' will be used to categorize aspects as what went well, what didn't go well, and what was horrible.  

## The Good

Overall, our first time implementing Terraform (both my own and the company), was a success.
The Terraform CLI, documentation and workflows were easy to follow and we were able to quickly put together some modules that would control our data stores. Communicating resource names between Terraform and Serverless via SSM parameters was also recommended by the Serverless documentation, and that pattern has worked very well so far. 

Once we had remote state management configured via an S3 bucket and DynamoDB table, our resources were being created and maintained reliably via a CI/CD pipeline. 
Hitting that milestone gained us a lot of confidence from management and our colleagues in cloud ops. 

In terms of practical value gained from using Terraform over CloudFormation, it cannot be overstated how great it was to be able to automate resource creation in other SaaS products that we needed for testing. 
It has probably saved us countless hours of debugging and documentation, while reducing the cognitive load on the devs and QA engineers. 

From the start, we built all of our templates with the idea that a developer should be able to launch their own stack of the service into a region of AWS, regardless of if another instance of the stack already exists that was stood up by another developer. 
This was a very easy quality of the service to maintain, and ended up being crucial for the project since our our localstack implementation fell into disrepair due to time constraints.

Finally, I'll state that so far, we've had no issues in production related to Terraform. 
It's worked perfectly for all customer-facing services in the six production deploys we had done - no create, modify or destroy actions took place on resources in production that we didn't expect. 

## The Bad

Ok, so how about stuff that didn't go so great?

### Multiple Modules 

For starters, I missed the memo on setting up your project with many smaller modules orchestrated together. 
I'm still not sure what to use for orchestration for that, but the way the project ended up was there was a single mega module that was composed of many smaller modules, and some of these even had child modules of their own. 

The test resources I mentioned above are also controlled by this mega module. 

This meant that any time I wanted to add a new resource of any kind, I'd need to rerun `terraform apply`, which would lead to a very long (>500 lines) plan file stating what wasn't changing and included a few lines about the new resource being created. 
This pattern made change management more difficult than it should have been, and it resulted in the change plans never really being read by anyone before the changes were applied. 

### Bitbucket CI/CD's Limitations Impact Terraform

In terms of applying Terraform changes via CI/CD, bitbucket pipelines leave much to be desired. 
Most of our Terraform modules were creating AWS resources, and our mega module used S3 and DynamoDB for state management. 
This meant that anytime we used Terraform, we needed appropriate AWS credentials in whatever environment was calling Terraform. 
The way to do this with Bitbucket Pipelines is to populate the AWS credentials in "Deployments". 

The problem with this approach is you can only call a `Deployment` on a single "step" within a pipeline. 
`steps` are the smallest unit of execution within a Bitbucket Pipeline that can be halted and require manual input before proceeding. 
Since we need AWS creds when using Terraform, we can't call `terraform plan -out=tf.plan` and then `terraform apply tf.plan` in a subsequent `step` unless we duplicated the `Deployment` within Bitbucket. 
We didn't want to do that since we don't have something else managing our Bitbucket Deployment configurations, so planning during production deployments is not done - instead we opt to trust ourselves to test appropriately in lower environments before promoting to production. 

Thankfully, we are allocated appropriate time and resources for that, but it would be nice if we could use `terraform plan` as it was intended.

### Nice-to-Know Patterns Discovered After Working With Terraform

Some patterns that I recognized along the way that I wish I knew about when I started. 

For one, when making modules, ensure you pass in a single "environment_identifier" variable instead of components of them when you want to ensure you avoid name collisions in a managable way. 
The values I was using was usually a combination of the entity deploying the resource (developer's name or 'cicd'), the region being deployed to and the 'stage' being deployed to (dev vs. stag vs. prod). 
I should have recognized the code smell when I wanted to modify the order, I'd need to make edits in four different places instead of one, but you live and you learn.

Another pattern that I should have recognized was that when I was creating SSM variables that were to be consumed by different services outside of the mega module (Serverless, another project using Terraform, etc.), that I should be creating them in the top module, as they're effectively side-effects in everything else. 
This wasn't obvious at first, but it would have made things much easier to find when I was going back and I couldn't quite figure out what an SSM parameter was for and how it got its value. 

That about sums up the "bad" parts of the implemention, now on to...

## The Ugly

There was only one particularly awful thing I implemented that I regret immensely with the knowledge I have today, and that was how we utilized Terraform workspaces. 

We used `Terraform Workspaces` to separate deployments within the same backend, which the Terraform docs expressly warn you not to do so: 

"Important: Workspaces are not appropriate for system decomposition or deployments requiring separate credentials and access controls. Refer to Use Cases in the Terraform CLI documentation for details and recommended alternatives."

Our workspace names looked like this: `$DEVELOPER:$AWS_REGION:$STAGE`, where the `$` indicates an environment variable.
DEVELOPER was pretty much a constant for each dev, and for AWS_REGION we'd typically deploy to `us-east-2`.
STAGE would change frequently as it controlled whether or not you could load the microservice UI outside of one of the supported monoliths. 
Whenever we'd want to change workspaces, we'd run the terraform command `terraform workspace select $DEVELOPER:$AWS_REGION:$STAGE` which was then aliased to an npm script. 
This was fine for me, but for the team it lead to the following problems:

* devs would deploy to a region that was different from the region mentioned in their workspace name 
* devs would think they are deploying to one stage when really they were deploying to another

And this happened more frequently than I care to admit. 
Both problems were caused by devs forgetting to run the npm script to change their workspace, or they'd open a new instance of their terminal with reset environment variables and try to deploy with incorrect variables set.

It was unnecessarily complicated and too easy to put the environment into an incorrect state. 
I set up my team to fail when it came to setting up this aspect of the development environment.

If I were to do this again, I'd reduce the number of our individual workspaces to one per developer, and I'd follow the pattern of separating the modules out into a `manifests` folder while writing out the environments being deployed to in an `environments` folder. 
The `manifests` folder would contain our Terraform modules, and the `environments` would contain the configuration information required to deploy to the different environments. 
Variables such as the AWS_REGION and STAGE that we were being deployed to would be hard coded into the different folders of `environments`.  

I'd probably also use something like Terragrunt to make my Terraform code DRY, but I don't have enough experience with it to say one way or the other.  

## Conclusions

After this whole project, I've come to some conclusions.

#### Would you recommend Terraform?

Yes, in general Terraform is pretty great. I'd say you should avoid it if you're a smaller company that is new to automated infrastructure management, and you aren't using a ton of highly configurable SaaS products (i.e. everything in AWS). 
At this point, just use CloudFormation or the CDK. 
The out-of-the-box remote state management in the form of stacks is good enough to not worry about selecting the optimal solution for your usage of Terraform.

As your company grows, you might want to start thinking about being "cloud-agnostic". 
This is not easily achieved, but writing your templates in Terraform will at least enable you to learn one tool to manage your infrastructure instead of one tool per cloud provider. 
It also opens you up to cost-savings as sometimes a dedicated company is able to provide a cheaper service than what AWS offers, even factoring in additional integration charges, such as Bunni or CloudFlare for a CDN instead of AWS CloudFront.


## tl;dr

* We've successfully launched into production, with no issues related to Terraform (yet)!!
* Terraform added a lot of value in configuring SaaS services we needed outside of AWS for our project
* Avoid mega modules composed of smaller modules. The code-smell to look for is your deployment plan line counts are approaching 4 digits
* Don't use Terraform Workspaces to manage different deployments, even in development. Separating for deployment entity is fine though

