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
    * regrets of not creating abstract classes of each, and instead making the base class the mysql implemenation. This meant that forgetting to reimplement a method in an extended class doesn't generate an error until runtime when it tries to run the parent method and connect to a database that doesn't exist. Starting with an abstract class with abstract public methods would generate errors that the IDE would catch
3. backtracking from MySQL 5.7 to 5.6
    * key length had to change ot match the 767 byte prefix limitation of keys  
