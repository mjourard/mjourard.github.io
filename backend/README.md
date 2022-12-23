 # Blog Backend
 
Features currently supported:

* gathering user impressions for later analytics

Features in development:

* comments section
* impression summary

## Deployment 
### Tools Needed
* terraform
* npm

### NPM Scripts
* backend:server:tf:init
* backend:server:tf:workspace:create
* backend:server:tf:workspace:select
* backend:server:tf:workspace:list
* backend:server:tf:apply
* backend:server:tf:format
* backend:server:tf:destroy
* backend:server:build
* backend:server:deploy
* backend:client:build
* backend:client:watch

backend:server:tf scripts will control terraform and they should be launched first.
You'll need to configure the tfvars file first as well as fill in the terraform backend file.

Once you've deployed the terraform modules, you can build and deploy the backend with backend:server:build and backend:server:deploy

Once you've run `backend:server:deploy`, copy the URL to one of either .env.development or .env.production, depending on what stage you deployed.
You can then run `backend:client:build` or `backend:client:watch` depending on if you want to build a development or production client, and it will target the URL you set in the `.env` file.

### Environment Variables
* STAGE - must be one of [dev, prod]
* DEVELOPER - a string identifying you so unique deployments can be created with Terraform
* AWS_DEFAULT_REGION - an aws region string
