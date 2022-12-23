---
title: "Hot Reloading of Local Typescript Lambdas"
tags: Typescript AWS Lambda Localstack Serverless Webpack Tooling
---

The AWS Lambda development experience can be frustrating at times.
At some point during development I find myself in the repetitive feedback loop of writing a change, building, deploying, then checking that it works.
Other modern toolsets have built in solutions to view changes on the fly.
Let's setup lambda hot reloading so that we can have faster serverless development.

![gif showing project refreshing and browser changing]({{ site.url }}/assets/img/lambda-hot-reloading.gif)

The example project for this article will be a simple typescript lambda that is accessed through API Gateway.
We'll also be using the Serverless Framework for our Infrastructure-as-code tool, as it makes for much smaller templates compared Cloudformation or SAM templates.
It also has many other features built in that make for a nicer infrastructure development experience such as multiple ways to load in variables, file concatenation, cors support out-of-the-box and sensible default outputs.
It also has a plugin system that allows for other Serverless Framework users to extend the framework's functionality, which is exactly how we'll be tying together our infrastructure to create hot reloading.

To reproduce AWS services locally, we'll be using [Localstack](https://github.com/localstack/localstack) hosted within a local docker container.
The standard serverless plugin for reproducing AWS services is normally [Serverless-Offline](https://github.com/dherault/serverless-offline), however it only simulates Lambda and API Gateway.
Architecture for any non-trivial project can grow in unpredictable ways and Localstack will give us the flexibility to update our local environments to match production when those growth spurts occur.
Localstack supports most AWS services out of the box, though sadly a lot of the non-base services are [locked behind a paywall](https://github.com/localstack/localstack/blob/master/doc/feature_coverage.md).

This article focuses on the following toolchain:
* Infrastructure-as-code: Serverless Framework (v2)
* Typescript Compiler / lambda bundler: Webpack (v5)
* Container: docker (v20)
* Container orchestration: docker-compose (v1.29)
    * We will be launching our own Localstack docker container and not using the one that the serverless-localstack plugin can spin up
* AWS infrastructure Mocking: Localstack (v0.12.18)

Here is a link to a working example repo with the full config files: [https://github.com/mjourard/typescript-hot-reloading-lambda-example](https://github.com/mjourard/typescript-hot-reloading-lambda-example)

You'll probably want to clone this repo and run it to make sure everything I'm saying in this article is still true.

We'll also use the following serverless plugins to make deploying to local and production seamless:
* serverless-webpack
* serverless-localstack


> **_NOTE:_**
> At the time of writing, there's a bug in serverless-localstack that causes it to overwrite the handler location on lambda functions even if the plugin is disabled while you have custom -> lambda -> mountCode set to *true*.
We'll be using this setting, which means that we need to maintain two different serverless templates - one with the plugin and one without.
It's not ideal but it wasn't worth the trouble of having a more elegant workaround.

On to the settings.

## Main Config Files

The node modules and npm scripts we'll use for dependencies are here:
```json
{% include hot-reloading-of-local-typescript-lambdas/package.json %}
```

The following `docker-compose.yml` template will spin up a docker container with the correct configs for Localstack all set:

```yaml
{% include hot-reloading-of-local-typescript-lambdas/docker-compose.yml %}
``` 

And our serverless template will look something like this:

```yaml
{% include hot-reloading-of-local-typescript-lambdas/serverless.yml %}
```

Finally, we'll make a simple webpack config file:

```javascript
{% include hot-reloading-of-local-typescript-lambdas/webpack.config.js %}
```

## Settings Explanation

This section will expand upon settings that I felt were ambiguous in their description or had to be fiddled with to get the setup to work.

### package.json
---
#### scripts (commands ran via `npm run <command_name>`)

> **"deploy:local": "SLS_DEBUG=\* sls deploy --config serverless-local.yml --stage local"**

`SLS_DEBUG=*` turns on debugging at the Serverless Framework level.
It can be removed once we are deploying to a CI/CD build system.

> **"build": "sls package"**

The `serverless package` command is used here to populate the `slsw.lib.entries` object in the `webpack.config.js` file.

We **CAN NOT** start webpack by running `webpack` or we'll have an empty `entries` object, nothing will be built, and somewhere in the world a puppy will cry.

#### devDependencies
> **"nodemon": "^2.0.14"**

A daemon we use to watch our `src` directory for changes.
If you want to use a different daemon, remember to update the `build:watch` script.

### docker-compose.yml
---
#### Ports
The port we set for the `EDGE_PORT` environment variable later in this file must be bound and exposed here.

#### Environment Variables
> **_NOTE:_**
> A quick blurb on `${}` docker-compose values - they will either load the value from your environment variables or from a local `.env` file.
> I've included a `.env.dist` file in the linked repo as an example file. Feel free to copy it to `.env` and set your own values.


##### SERVICES
This is a list of all the AWS services we want to initialize.
When working with the serverless framework, these are the absolute minimum required because of how the services rely on each other.
Yes, you might think we only need API Gateway and Lambda because our serverless API doesn't use any other services at the application level.

You'd be wrong, however.
API Gateway will use Route53 and Certificate Manager to create the DNS entry needed for our "publicly" available API.
Lambda will need access to the IAM service in order to know that it is allowed to be invoked at all.
Lastly we'll need S3 because by default, serverless will upload the compiled cloudformation template to S3.

##### DEBUG
Setting this to `1` will get us service-level errors when our Localstack AWS calls fail.
This was important for me to diagnose why my Serverless template wasn't deploying to my Localstack container.
The culprit was the S3 bucket name generated by SLS - it was longer than the allowed 63 characters for bucket names and so the cloudformation template was failing when trying to create the bucket.
This was hard to diagnose without the normal AWS Console available, so the debug statements output by the Localstack docker container were alternative.

##### DATA_DIR
This is a folder within the Localstack container that Localstack will write to.

##### HOST_TMP_FOLDER
Somewhere to persist the Localstack settings on your host once the container goes down.
This value should get set as a volume within this file.

#### volumes
> "${TMPDIR:-/tmp/}localstack:/tmp/localstack"

A way to save your Localstack invocations locally.

> "/var/run/docker.sock:/var/run/docker.sock"

A simple case of feeding in the docker daemon to Localstack so it can launch other docker containers for your local lambdas on your computer.


### serverless.yml
---
#### custom.localstack.edgePort
This value must match what we've set in our docker-compose file for the `$EDGE_PORT`

#### custom.localstack.autostart
Setting this to `true` would force the plugin to launch its own Localstack docker-compose file.
We don't want that for any kind of complex local environment, so we'll keep it `false`.

#### custom.localstack.lambda.mountCode
This **SHOULD** be true, as it tells the `Localstack` plugin to mount the directory you're launching `serverless` from into the `/var/task` directory of the lambda container.
This puts the `.webpack` folder into the `/var/task` directory, which is where lambda will look when referencing the `Handler` setting of individual lambda functions.

#### plugins
> serverless-localstack

Comment out this plugin when you're deploying to non-local AWS as there is currently a bug in which your lambda's handler path will be overwritten with the localstack-appropriate path even if the plugin is "disabled".

`.webpack/service/src/handler.js` vs `src/handler.js`.

This is why there are two nearly-identical `serverless` configurations in the example repo I linked at the start of the article.

## Additional Tools

In addition to having `npm` and `docker` installed locally, we'll also want to install [awslocal](https://github.com/localstack/awscli-local).
This is Localstack's wrapper over the `aws` cli which forces it to point at our Localstack docker container.
The wrapper is not strictly needed as you can simply pass `--endpoint-url=http://localhost:${EDGE_PORT}` to each cli call, but that's an awful experience.

Once we've got it installed, add the environment variable `EDGE_PORT=4570` to whatever terminal you're in.
That's the environment variable that `awslocal` will use for the port to connect to.

## Working With The Environment / Example Setup Instructions

Ok so we've got the settings explained, now here are instructions for setting up the example repo for hot reloading.

1. Clone the repo
2. Install the `node_modules` locally with `npm install`
3. Copy the `.env.dist` file to `.env`. Delete the `TMPDIR` line if you've got a **$TMPDIR** environment variable already.
4. For the first time starting up, in the `.env` file, use the following settings as it'll make debugging easier:
```
DEBUG=1
LS_LOG=debug
Full call is "DEBUG=1 LS_LOG=debug docker-compose up" 
```
5. Start up your docker-compose template with `docker-compose up` and wait for a line similar to the following: `localstack_1  | 2021-10-25T02:31:11:INFO:bootstrap.py: Execution of "start_api_services" took 9207.62ms`
6. In a new terminal, cd into the cloned repo and run `npm run deploy:local`. This will have a lot of output but the part you're looking for at the start is the following:
```
...
Serverless: Using serverless-localstack
Serverless: Reconfiguring service acm to use http://localhost:4570
Serverless: Reconfiguring service amplify to use http://localhost:4570
Serverless: Reconfiguring service apigateway to use http://localhost:4570
Serverless: Reconfiguring service apigatewayv2 to use http://localhost:4570
Serverless: Reconfiguring service application-autoscaling to use http://localhost:4570
Serverless: Reconfiguring service appsync to use http://localhost:4570
Serverless: Reconfiguring service athena to use http://localhost:4570
Serverless: Reconfiguring service autoscaling to use http://localhost:4570
Serverless: Reconfiguring service batch to use http://localhost:4570
Serverless: Reconfiguring service cloudformation to use http://localhost:4570
Serverless: Reconfiguring service cloudfront to use http://localhost:4570
Serverless: Reconfiguring service cloudsearch to use http://localhost:4570
Serverless: Reconfiguring service cloudtrail to use http://localhost:4570
Serverless: Reconfiguring service cloudwatch to use http://localhost:4570
Serverless: Reconfiguring service cloudwatchlogs to use http://localhost:4570
Serverless: Reconfiguring service codecommit to use http://localhost:4570
Serverless: Reconfiguring service cognito-idp to use http://localhost:4570
Serverless: Reconfiguring service cognito-identity to use http://localhost:4570
Serverless: Reconfiguring service docdb to use http://localhost:4570
Serverless: Reconfiguring service dynamodb to use http://localhost:4570
Serverless: Reconfiguring service dynamodbstreams to use http://localhost:4570
Serverless: Reconfiguring service ec2 to use http://localhost:4570
Serverless: Reconfiguring service ecr to use http://localhost:4570
Serverless: Reconfiguring service ecs to use http://localhost:4570
Serverless: Reconfiguring service eks to use http://localhost:4570
...
```
This is saying that the serverless-localstack plugin is rewriting serverless to point at our Localstack container when making calls to AWS services.
7. Eventually when the local deployment is done, we'll get output like the following:
```
Service Information
service: typescript-local-lambda
stage: local
region: us-east-1
stack: typescript-local-lambda
resources: 11
api keys:
  None
endpoints:
  http://localhost:4570/restapis/2tfmo0ytms/local/_user_request_
functions:
  example: typescript-local-lambda-local-example
layers:
  None
Serverless: Invoke aws:deploy:finalize
Serverless: Using custom endpoint for S3: http://localhost:4570
Serverless: [AWS s3 200 0.028s 0 retries] listObjectsV2({
  Bucket: 'typescript-local-lambda-serverlessdeploymentbucket-f4b78ac0',
  Prefix: 'serverless/typescript-local-lambda/local'
})
```
The important value here is the `endpoints` section.
Copy that value into your browser and then append our defined lambda's `path` from your `serverless-local.yml` template.
e.g using the example template above and the output, the full endpoint would be:
`http://localhost:4570/restapis/2tfmo0ytms/local/_user_request_/hello`
When I navigate to that URL, I get the following output:
```json
{ 
    "message": "This is a typescript serverless lambda function!", 
    "path": "/hello"
}
```
8. Finally, run `npm run build:watch` to have `nodemon` start watching our `src` folder. We can then edit the message string in `src/handler.ts` and save the file. Once saved, webpack will be triggered and the deployed lambda code will be updated automatically. You can then refresh your browser to see the updated message and confirm that hot reloading of our typescript local lambdas is working.

With all of that done, we've got a local development environment.

> **_NOTE:_**
> The biggest thing to keep in mind is with the setting of **LAMBDA_EXECUTOR=docker-reuse** within the **docker-compose.yml** file,
> your lambda docker containers will not go down automatically when you stop your Localstack container.
> You'll need to stop them manually

## For Your Understanding
Some exercises to better understand how our environment is configured:
### See how our lambda containers are getting their code
While our environment is up and running, get the container id of our lambda container by running `docker ps`.
Example output:
```
CONTAINER ID   IMAGE                             COMMAND                  CREATED         STATUS          PORTS                                                                     NAMES
b80450134ca1   localstack/lambda-js:nodejs14.x   "/bin/bash"              6 seconds ago   Up 4 seconds                                                                              localstack_lambda_arn_aws_lambda_us-east-1_000000000000_function_typescript-local-lambda-local-example
20a6014860ce   localstack/localstack:0.12.18     "docker-entrypoint.sh"   3 hours ago     Up 20 minutes   0.0.0.0:4566-4597->4566-4597/tcp, :::4566-4597->4566-4597/tcp, 5678/tcp   typescript-hot-reloading-lambda-example_localstack_1
```
We'll grab that first container id since I know from the image it's our lambda.
I'll then run the following:  {% raw %}`docker inspect -f '{{ .Mounts }}' b80450134ca1`{% endraw %}

Which gives me this:
```
[{bind  $HOME/git_repos/github.com/mjourard/typescript-hot-reloading-lambda-example /var/task  rw true rprivate}]
```
Which explains why the lambda handler will have the path of `.webpack/service/src/handler.js`.

### View your Localstack AWS resources
With the previously installed `awslocal` cli, we can now check what Localstack has launched.
Here are a set of commands showing what we've got running:
```
# get our Localstack s3 buckets that serverless would deploy to
awslocal s3api list-buckets

# list our currently deployed lambda functions
awslocal lambda list-functions

# how we'll access cloudwatch logs and lambda output. It's messy 
awslocal logs describe-log-groups
awslocal logs describe-log-streams
awslocal logs describe-log-streams --log-group-name <your-log-group-name-here>
awslocal logs get-log-events --log-group-name <your-log-group-name-here> --log-stream-name <your-log-stream-name-here>
```

The list-functions call with lambda will show us the **Handler** value of the lambda itself.
I used both the S3 and Lambda apis liberally for debugging when setting up this environment, and they may be useful to you as your use case grows in complexity.

## Conclusion
We've now got an API Gateway sitting in front of our Lambda function being ran from docker containers on our local machine.
We also know how to access the exposed APIs of our local AWS services and have confirmed our Serverless template is being deployed properly to our local environment.

One final note I'd like to touch on is that this environment should NOT be our primary place of development.
If the project is structured properly, there should be a good separation between the business logic and the code that is Lambda or API Gateway specific.
We should know the business logic of our Lambda functions will work correctly through a proper automated test suite.

With that being said, there will come a time in a complex environment when it is simply nice to be able to run everything locally in order to test out theories and quick fixes.

Thank you to the contributors of the Serverless Framework as well as Localstack for making this possible.

Happy coding!


