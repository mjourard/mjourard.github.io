---
title: "Distributed Application Logging Strategy - Part 1"
tags: Observability
series_name: prod-problems
---

points to touch on:

* understand the differences between logs, metrics and tracing
    * logs can help tell a story of data moving through a system
    * monitoring reports that something happened and can be aggregated together easily. 
* situations of when you want logs vs metrics vs tracing
* pick a good base logger project, all popular languages have them. the package should handle things like 
    * giving a framework for the user to supply a format for logs to take on. They might supply their own popular standard formats.
    * configuration to write logs to different outputs i.e. to a single rotated file, stdout, etc.
* figure out what logging levels you want to support.
    * there's the 8 that the unix util syslog supports and have been replicated to many different systems
        * https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
    * debug, info, warning and error are perfectly good enough for most simple applications and microservices.
    * document this within your repo, it should be easily accessible by devs maintaining the project
* If you have a long-running process that processes chunks of work at a time, such as a web server handling web reqeusts
    * ensure your methods of initializing the logger has access to whatever context variable your system uses, so that each log entry that is made during the processing of said small chunk will have the requestid attached to it.
    * log-info are used as information about where the processe is. These generally always show up
    * debug is for..
    * warning is for...
    * error is for..
* talk about the tracing standards that exist
    * https://aws.amazon.com/what-is/distributed-tracing/
        * 
    