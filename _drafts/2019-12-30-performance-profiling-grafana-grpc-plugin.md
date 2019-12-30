---
layout: post
title: "Performance Profiling Grafana gRPC Backend Plugin!"
date: 2019-12-30
---
Back in February of 2018, I was tasked with creating a datasource plugin for [Grafana](https://grafana.com/) at my work that would allow us to create graphs based on logs we had shipped to [Scalyr](https://scalyr.com/).
At the time, Grafana had just released version 5.0.0 and it did not have built-in backend support for datasources that were not native to Grafana. It did however, support making http calls from the Grafana backend to another web service.

The strategy was to have a server with Grafana, Nginx and Php-fpm sitting on the same server. Nginx would serve as a reverse proxy for both Grafana and Php-fpm, with Grafana being available to the world while Php-fpm was available only to Grafana. From there, Php-fpm would make calls to the Scalyr api to fetch logs and massage the returned data into the type of response that Grafana was expecting.
It was messy, and the lack of Grafana documentation at the same didn't help, but I got it working and it served us well, with iterative enhancements made over time.   
