---
title: "Terraforming Our Infrastructure - Part 2"
tags: Terraform IaC AWS Tooling
series_name: terraforming-our-infrastructure
---

A quick update article on some issues we've encountered while ramping up on Terraform as well as how we solved them.

## New Team Member on Windows

Up until now, our dev team was entirely on macs.
This changed when a new developer was transferred onto our team from a different part of the organization.
Their previous team was focused on supporting a **C#** application, and so this new teammate had a Windows computer.
I've had previous experience as a dev on a Windows machine and while I expected there to be a few "gotchas", I knew it would be manageable.

We decided to get him setup with the **Windows Subsystem for Linux (WSL)** as that would give him access to the setup and support bash scripts we've developed for this project.
Since the developer was new to Linux and the rest of the project's tech stack, we had them configure an instance of **Ubuntu** within the WSL. 
The WSL has come a long way since its initial launch, and now my only complaint at this time are the awful disk read/write times from the VM to the host machine.
Other than that, it can power a pretty solid dev environment. 

Focusing on challenges with Terraform, the Windows + WSL setup did not co-operate with our hacked variable file setup that I mentioned [in part 1]({% post_url 2021-11-07-terraforming-our-infrastructure-p1 %}#variablestf).
The values did not export to environment variables correctly, and so when they tried to run terraform, they were met with incorrect value types caused by line-ending errors. 
Not a fun experience.
We quickly converted the `.env` files to `.tfvars` files and noticed that their issues went away completely; they were able to deploy the Terraform modules themselves.

While it was likely a quicker fix to get this developer's source tree to import linux line endings or even to clone the repo within the WSL, we didn't know those would be the true fixes and it was a quick update to follow Terraform best practices.    

I'll also note that the Windows developer has not run into any issues with Terraform since we've converted to using `.tfvars` files, so kudos to Hashicorp for making a solid piece of software.

## Storing State Files in us-east-1

The few people reading this were probably affected by the **AWS us-east-1 outtage** that occurred on [December 8th, 2021](https://www.techradar.com/news/aws-is-down-and-taken-whole-chunks-of-the-internet-with-it).
The tl;dr of that incident is that the entire region was responding to API calls with error messages for the entire work day.
It sucked, especially for operations teams that had applications in that region.

Thankfully, our developer responsibilities kept us far away from that dumpster fire.
However, I was foolish enough to store our state files and state locks in us-east-1. 
DynamoDB and S3 are offered in most regions, so there was no reason to do this.

I'll not be making that mistake again.
Future state locks/files will be stored in either **ca-central-1** or **us-east-2**.
We're planning to move our existing state management infrastructure into a different region as well.

## Loosely Couple Unique Identifiers Within Modules

This is a Terraform best practices recommendation that we are going to start using, but basically when you've got resources in your modules that have unique naming requirements, have a module input variable be a unique identifier.
This means that if your unique identifying format updates, you only need to update your root module and the unique changes will propogate to your lower modules.

The issue that caused this was we added a 3rd dimension to our workspace names. 
Before, it was just $STAGE:$AWS_REGION, and now it's $STAGE:$AWS_REGION:$DEVELOPER_NAME.
It should have been a code smell when I was first refactoring to add the 3rd dimension in each of the modules that there was a better way to do this, but alas I didn't catch it.

The actual resource I was creating in a module that required updating was an [okta user account](https://registry.terraform.io/providers/okta/okta/latest/docs/resources/user).
The resource's email property looked something like this: `email = format(test.%s.%s@example.com, var.stage, var.aws_region)`.
I then updated it to look like this: `email = format(test.%s.%s.%s@example.com, var.stage, var.aws_region, var.developer)`.
While this worked, had I just made it this instead: `email = format(test.%s@example.com, var.unique_identifier)`
The module would be much more adaptable to other workflows, like say if I wanted to add a 4th dimension such as $JIRA_TASK_ID.

## Take Care of Your Locks

While us-east-1 was down and our state files and lock objects were equally stuck, we couldn't take down the infrastructure using Terraform in us-east-1.
This ultimately was unnecessary for what I was trying to do but it was a good introduction to what happens when Terraform breaks while it has a lock file and how to recover from it.

When a process running Terraform dies while it has acquired a lock, then that Terraform **workspace** becomes unusable. 
You'll need to manually release the lock with the [force-unlock command](https://www.terraform.io/docs/cli/commands/force-unlock.html).
Thankfully, the locking error will give you some helpful info about the machine that has the lock when Terraform errors out. 
You should then check that machine to make sure Terraform is no longer running.

If it has, run the force-unlock command while in the workspace that is locked. 
This is important and something I missed at first, as if you're not in the correct workspace, Terraform will tell you it can't find the lock or the lock is made of **invalid json**.

## tl;dr

* terraform handles different line endings very well when they are contained within `.tfvars` files
* don't stick your state management resources in the same place as your application infrastructure if you're trying to be region fault-tolerant
* don't use **AWS:us-east-1** if you can avoid it
* loosely couple your unique identifiers from within your module to your root module

Terraform is great. 
I'm looking forward to making a part 3!
