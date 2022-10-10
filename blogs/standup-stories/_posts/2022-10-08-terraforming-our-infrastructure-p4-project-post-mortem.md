---
title: "Terraforming Our Infrastructure - Part 4 - Project Conclusion"
tags: Terraform IaC AWS Tooling Port-Mortem
series_name: terraforming-our-infrastructure
---

Our microservice has been launched and in production for a few months now. It's now being consumed by two of our monoliths and the powers-that-be are now directing us off the micro-service towards other, more pressing contractual obligations. I'd like to take some time to reflect on the project and how Terraform was utilized so that I can look back and say what went well and what didn't go well. 

## The Good

As far as our first time implementing Terraform (both my own and the company), I would say it was an overall success. The CLI, documentation and workflows were easy to follow and we were able to quickly put together some modules that would control our data stores. Communicating resource names between Terraform and Serverless via SSM parameters was also recommended by the Serverless documentation, and that has worked very well so far. 

Once we had state management worked out via an S3 bucket and DynamoDB table, our resources were being created and maintained reliably as well via a CICD pipeline. That milestone in the project gained us a lot of confidence from management and our colleagues in cloud ops. 

In terms of practical value added from Terraform as opposed to the CloudFormation that was our company standard, it cannot be overstated how great it was to be able to automate resource creation in other SaaS products that we needed for testing. It has probably saved us countless hours of debugging and documentation. 

Finally, I'll state that so far, we've had no issues in production related to Terraform. It's worked perfectly for all customer-facing services. 

## The Bad

Ok, so how about stuff that didn't go so great?

For starters, I missed the memo on setting up your project with many smaller modules orchestrated together. I'm still not sure what to use for orchestration for that, but the way the project ended up was there was a single mega module that was composed of many smaller modules, and some of these even had child modules of their own. The test resources I mentioned above are also controlled by this mega module. This meant that any time I wanted to add a new resource of any kind, I'd need to rerun `terraform apply`, which would lead to a long plan file stating what wasn't changing and included a few lines about the new resource being created. This pattern erased a lot of the out-of-box benefit of Terraform, since these change plans were never really read by anyone in practice. 

Also, in terms of launching via CICD, I'll say that bitbucket pipelines are garbage to use with Terraform. All of our Terraform modules were creating AWS resources and using S3 + DynamoDB for state management. This means that anytime we used Terraform, we needed appropriate AWS credentials in whatever environment was calling Terraform. The way to do this with Bitbucket Pipelines is to populate the AWS credentials in "Deployments". 

The problem with that, is you can only call a Deployment on a single "step" within a pipeline. "steps" are the smallest unit of execution within a Bitbucket Pipeline that can be halted and require manual input before proceeding. Since we need AWS creds when using Terraform, we can't call `terraform plan -out=tf.plan` and then `terraform apply tf.plan` in a subsequent step unless we duplicated the Deployment within Bitbucket. We didn't want to do that since we don't have something else managing our Bitbucket Deployment configurations, so planning during production deployments is not done - instead we opt to trust ourselves to test appropriately. Thankfully, we are allocated appropriate time and resources for that, but it would be nice if we could use `terraform plan` as it was intended.

Finally, some patterns that were "discovered" along the way that I wish I knew about when I started. For one, when making modules, ensure you pass in a single "environment_identifier" variable instead of components of them when you want to ensure you avoid name collisions in a managable way. The values I was using was usually a combination of the entity deploying the resource (developer's name or 'cicd'), the region being deployed to and the 'stage' being deployed to (dev vs. stag vs. prod). I should have recognized the code smell when I wanted to modify the order, I'd need to make edits in four different places instead of one, but you live and you learn.

Another pattern that I should have recognized was that when I was creating SSM variables that were to be consumed by different services outside of the mega module (Serverless, another project using Terraform, etc.), that I should be creating them in the top module, as they're effectively side-effects in everything else. This wasn't obvious at first, but it would have made things much easier to find when I was going back and I couldn't quite figure out what an SSM parameter was for and how it got its value. 

That about sums up the "bad" parts of the implemention, now on to...

## The Ugly

There was only one particularly awful thing I implemented that I regret immensely with the knowledge I have today, and that was how we use and abuse Terraform workspaces. It says right there on the article about workspaces: 

"Important: Workspaces are not appropriate for system decomposition or deployments requiring separate credentials and access controls. Refer to Use Cases in the Terraform CLI documentation for details and recommended alternatives."

and we were using them to separate deployments within the same backend. 

I mentioned earlier that our workspace names looked like this: `$DEVELOPER:$AWS_REGION:$STAGE`. 
This lead to the following problems:

* devs would deploy to a region that was different from the region mentioned in their workspace name
* devs would think they are deploying to one stage when really they were deploying to another

And this happened more frequently than I care to admit. It was gross and to be honest I kind of set up my team to fail when it came to not falling into those pit falls. 

If I were to do this again, I'd keep it so that we each had our own individual workspaces, probably called `$DEVELOPER`, and I'd use something like Terragrunt that would check in the individual stage deployment changes. 
This would result in different commands for deploying to different stages, and less magic going on behind the scenes for devs. 

## Conclusions

After this whole project, I've come to some conclusions.

#### Would you recommend Terraform?

Yes*, with a big asterisk.

Here are some situations in which you should avoid Terraform, assuming your company primarily uses AWS:

* you're a smaller company that is new to automated infrastructure management, and you aren't using a ton of highly configurable SaaS products such that all your customer-facing 

TODO: EDIT THIS

## tl;dr

* We've successfully launched into production, with no issues related to Terraform (yet)!!
* Terraform added a lot of value in configuring SaaS services we needed outside of AWS for our project
* Avoid mega modules composed of smaller modules. The code-smell to look for is your deployment plan line counts are approaching 4 digits
* Don't use Terraform Workspaces to manage different deployments, even in development. Separating for deployment entity is fine though