---
title: "Distributed Application Logging Strategy - Part 1"
tags: Observability
series_name: prod-problems
---

points to touch on:

* understand the differences between logs and monitoring
    * logs can help tell a story of data moving through a system
    * monitoring reports that something happened and can be aggregated together easily. 
* pick a good base logger project, all popular languages have them. the package should handle things like 
    * giving a framework for writing out standard formatting for logs, possibly supplying popular standard formats.
    * configuration to write logs to different outputs i.e. to a single rotated file, stdout, etc.
* figure out what logging levels you want to support.
    * there's the 7 that the linux kernel uses thathave been replicated to many different systems
    * debug, info, warning and error are perfectly good enough.
    * document this within your repo, it should be easily accessible by deves
* If you have a long-running process that processes chunks of work at a time, such as a web server handling web reqeusts
    * ensure your methods of initiialinzg the logger has access to whatever context variable your system uses, so that each log entry that is made during the processing of said small chunk will have the requestid attached to it.
    * log-info are used as information about where the processe is. These generally always show up
    * debug is for..
    * warning is for...
    * error is for..
    