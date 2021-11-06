---
title: "Terraforming Our Infrastructure - Part 1"
tags: Terraform IaC AWS Tooling
---

* blurb about infrastructure as code
* quick intro to Terraform 
* introduce this series - how it will be focused on my learning Terraform, the standard practices we develop and issues we run into

* ideas about how Terraform should be used at the moment:
  * projects should be re-usable and configurable
  * projects should be sharable between teammates and CI/CD pipelines
  * projects should output useful information

* standards currently being fleshed out
  * backends - using S3 + DynamoDB for AWS 
    * cross account stuff as proposed by other standards can be hard to adopt because of potential "security" implementations
    * keeping everything in a single bucket within the same account being deployed to is fine
  * version control
    * check in the lock file, don't check in state files (they shouldn't exist anyway if you're using a remote backend)
  * file separation
    * modules should include the following files: variables.tf, outputs.tf, providers.tf
    * in variables, the variable names themselves should all be UPPERCASE so that they don't look out of place when being passed in as environment variables
      * give example of bitbucket pipeline w/ script that is runnable from the terraform docker container
    * providers.tf would ideally include a range of acceptable providers since all modules need to agree on a single provider version #. If they, you can't use the two modules
  * show how to turn on/off modules using the count variable on the module itself
    * show what happens when you don't set it on the count but on individual items instead (and how the outputs get all fucky as they become lists)
  * methods of input
    * show local deployment via .env.dist files as well as through a normal CI/CD pipeline
    * give example of the .env file passing in a list of strings since that was annoying to figure out

* to be determined
  * good methods of sharing modules within the org - ideally should have something like npm/composer/bundle/go modules/etc. where terraform modules can be included and downloaded
    * potential services to check out:
      * cloudsmith.io
    * pass along via git submodules maybe?
    * does SEMVER work for versioning of these submodules?
  * how are tests written for terraform if at all? What exactly are infrastructure tests? Are they just application tests?
  * 
