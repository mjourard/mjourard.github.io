---
layout: post
title: "Migrating To A Serverless Architecture P3: Aurora Serverless"
date: TBD
---
Talking points:
1. The dataservice API and hidden costs
2. Adding in the data service client to an existing app
    * separating out the existing database calls from the view layer of the backend
    * creating child classes for each of the service classes that accessed the database that used the SQL queries of the parents to send to the aurora api
3. backtracking from MySQL 5.7 to 5.6
    * key length had to change ot match the 767 byte prefix limitation of keys  
