---
layout: post
title: Converting AngularJS App To "Serverless"
date:   2019-08-04 17:02
description: Process of converting an old single-server web app to a serverless infrastructure
comments: true
tags:
- serverless legacy-software angularjs
---

Topics to cover:
- setting up 1-touch deployment of an angularjs app
	- avoiding deploying 10000 files at each deployment, costing $0.50 per deployment
	- webpack basics + rewrite of requires
	- adding in deployment script to S3
- setting up lambda + api gateway to serve the php api
	- php lambda layer
	- setting up a deployment tool to apex
	- cloudformation template of the api
- adding in temporary database code for demo purposes

