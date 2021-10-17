---
title: "Hot Reloading of Local Typescript Lambdas"
tags: Typescript AWS Lambda Localstack Serverless Tooling
---

At work, we wanted to be able to replicate our project's infrastructure locally to make debugging and integration testing easier.
This was at the start of the project, where our tooling choices were still somewhat flexible. 
For our Infrastructure-as-code tool, we went with the Serverless Framework (SLS) since our use case made sense for API Gateway-powered lambdas. 
SLS also makes for much smaller templates than just straight cloudformation, and the team wasn't familiar with Terraform or the CDK.

To save some time, here's our toolchain, so you can decide if this article is both up-to-date and helpful to you:
* Infrastructure-as-code: Serverless Framework (v2)
* Typescript Compiler / lambda bundler: Webpack (v5)
* Container: docker (v20)
* Container orchestration: docker-compose (v1.29)
  * We will be launching our own localstack docker container and not using the one that the serverless-localstack plugin can spin up
* AWS infrastructure Mocking: Localstack (v)

Here is a link to an example repo with the full config files: 

As a good practice, you'll probably also want to clone this example repo and run it to make sure everything I'm saying in this article is still true. 

We also used the following serverless plugins to make deploying to local and production seamless:
* serverless-webpack
* serverless-localstack

Now at the time of writing, there's a bug in serverless-localstack that causes it to overwrite the handler location on lambda functions even if the plugin is disabled while you have custom -> lambda -> mountCode set to *true*.
We'll be using this setting, which means that we need to maintain two different serverless templates - one with the plugin and one without. 
It's not ideal but it wasn't worth the trouble of having a more elegant workaround.

On to the settings. 

For our localstack docker container, you can use the following `docker-compose.yml` template:



and the settings explained:

#### ports
these are the ports that localstack will bind on inside the container. 
These ports are not necessary to all bind, in fact you should be able to get away with just the port you have defined for the HOST_PORT variable

### Environment variables
#### Services
This is a list of all the AWS services you want to initialize. 
When working with the serverless framework, these are the absolute minimum required because of services relying on each other. 
Yes, you might think you only need API gateway and Lambda because your serverless API doesn't use any other services at the application level.
This however is untrue. API Gateway will use Route53 and Certificate Manager to create the DNS entry needed for your publicly available API. 
Lambda will need access to the IAM service in order to know that it is allowed to be invoked at all. And lastly you'll need S3 because by default, serverless will upload the compiled cloudformation template to S3.

### Networks
For good practice when working with docker containers in (I assume) an environment where you need to work on many different projects, we'll explicitly define a docker network 
so that your local serverless aws environment is segregated from any of your other projects.
Feel free to rename this network whatever you want. Just be sure to also update the network in the `LAMBDA_NETWORK` environment variable to match.


