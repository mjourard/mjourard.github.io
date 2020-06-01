---
layout: post
title: "What Was Trick or Eat"
tags: trickoreat draft
---

* TOC
{:toc}


## A Primer On Food Insecurity

Household food insecurity is the inadequate or insecure access to food due to financial constraints. 
As of 2016, prevalence of food insecurity ranges from 10.2% in British Columbia to 50.8% in Nunavut. 
Rates are even worse when looking at the number of children in food insecure households, where the number is closer to 1 in 6 nationwide.

[Food Insecurity Policy Research](https://proof.utoronto.ca/new-data-available/) 

## Meal Exchange and Trick or Eat

[Meal Exchange](https://www.mealexchange.com/team-info) is a nationally-recognized Canadian non-profit charity which coordinates student volunteers on university campuses in an effort to fight food insecurity across Canada. 
They support community-driven solutions such as food banks, campus kitchens, gardens and farms. 
They also provide mentorship and resources, connect students with like-minded peers across the country, and provide a single point of contact for provincial and national stakeholders in business, civil society and media.

Trick or Eat is Meal Exchange's Halloween food drive, in which student volunteers go door-to-door on Halloween collecting non-perishable food to give to a local cause, chosen at the discretion of the MX chapter running the event.

While the event was fun and extremely effective at Guelph, [bringing in between 20,000 to 40,000 pounds of food](https://www.guelphtoday.com/local-news/scary-situation-for-food-bank-as-u-of-g-students-wont-be-collecting-food-this-halloween-1716067), it was always a hectic start.
The following had to happen in order for someone to participate in the event:
1. The participant signs a typical liability release form for off-campus school activities
2. They then join a team, usually in tandom with friends they came to the event with
3. Their team would be given a collection route* and bus number** on a sheet of paper, and organizers would record the team-bus-route match up. 
4. Participants sit around for ~20 minutes, waiting for signups to close and their bus to start boarding (as notified by event staff via megaphone).
5. Once the bus finished boarding, it departs for their dropoff location, in which teams complete their routes and return to the pickup location with their shopping carts full of non-perishable food items.

<small>* The route was a residential route which had flyers delivered weeks in advance, notifying residents of trick or eat. Participant teams would walk the route with a shopping cart, knocking on doors collecting non-perishable food from the community.</small>

<small>** The bus was a chartered school bus that would take them to the drop-off point of their "zone" (a collection of routes with a central pick-up and drop-off point)</small>


Each of the above steps is very chaotic and challenging when done via pen and paper in a relatively small, loud space. 
The Trick or Eat app was designed to make organizing and running the event easier.
The app would run the event, allowing participants to do the following:

    * sign up
    * sign the waiver
    * create their teams
    * receive their bus and routes
    * submit event feedback
  
In subsequent years, the following would be easier through the app:

    * Contacting last year's participants
    * Passing along route information to event staff
        - the route on a map
        - amount of food collected in each route
        - any issues with the route to be fixed or avoided next year
    * Passing along collected participant feedback to further improve events in the years following

The above behaviours necessitated having regular participant features as well as admin features, which lead to using [role-based access control](https://en.wikipedia.org/wiki/Role-based_access_control) 

With objectives set, sponsored development through a grant and crowd funding started in 2016. 
A strong skeleton was created for the front end, backend and database structure before they ran out of funding.
I was handed the project to take up as an independent study unit the following semester.   

## Developing Trick or Eat  

The development instructions I received were to do it right the first time so that it wouldn't have to be redone all over again the second time. 
In theory this is sound advice, but in practice, it served to set the pace far too slow to be practical. 
At the time, I was a third/fourth year student with 4 semesters of development co-op under my belt. 
I was a barely junior-level software developer, learning three new frameworks and working on my own. 

This was a recipe for failure, as I tried to learn how to do AngularJS and Silex development the **right** way, while adding functional tests through PHPUnit. 
I often fell down rabbit holes, losing hours at a time on small problems that I could have hacked around with minimal long-term consequences. 

**Trick or Eat App Structure**

***

The Trick or Eat app stack is made of Nginx, AngularJS, PHP + Silex and MySQL, sitting on a linux box:

![image]({{ site.url }}/assets/img/toe_techstack.svg)  

As I was developing it, I added functional tests of the API using PHPUnit for easier verification of the backend api meeting requirements, as well as codifying the requirements that were produced. 
I also added a **docker-compose** script for easier creation of the development environment, as I hoped I would not be the last developer to work on it, and setting up an OS-agnostic development environment is 1000x easier with docker than without.

All of these extra non-feature tasks that I completed did slow down core development, however that was a choice made after missing the first deadline of 2 months after inheriting the app's skeleton for the Halloween of that year.

Progress to feature completion was gradual and after cutting a few non-essential admin features, was finished by the halloween of the following year.

## Launch Day

When launching a new app, it is important to have clear lines of communication with your primary stakeholders. 
At the time, I didn't step up and take initiative to engage in launch day planning as I was juggling other classes and extra-curricular activities. 
For these reasons, communication lines between myself and the event organizers fell flat, and we were not able to do any practice load tests of the app. 

Thankfully, the event organizers were veteran participants themselves, each with disability awareness training from the University of Guelph, so when they told me it ticked all the requirements for usability, performance and feature completion, I was confident we'd be able to have a successful first run. 
Still, I did not want to risk the success of the event on an app I wasn't able to do mock load testing on with the skillset I had at the time.
To compromise, we agreed that they would prepare the event to be run traditionally, with a select few teams test-piloting the app during the event.

They had arranged for a group of 30 people from a single residence on campus to test the app during the event. 
Unfortunately, on the day of the event, none of them showed up.  
Despite our efforts to get randomly selected participants to agree to use the app during the event, we received no feedback. 
I was heart broken. 

All in all, the test launch of the app was a ~~failure~~ learning opportunity.   

## Results

That year, the event ran successfully in the traditional manner, and we discussed additional features to be added for next year's event. 
These features were cut in favour of getting the base app functional. 
I spent the remainder of the semester as well as the following implementing the required features. 
The app was ready to go for a second run, however the following year was cancelled due to funding cuts from the provincial government. 

## Final Takeaways

Aside from the technical skills gained while developing the app, I learned a few key lessons from this project

**Feature completion should be prioritized over stability**

*** 

My attempt at increasing stability was to add the backend functional testing via PHPUnit. 
I spent a lot of dev time adding functional tests for the backend api, which could have been spent adding additional features to the app, and we could have been feature complete that much sooner.
Had I been feature complete sooner, we could have focused on group testing and developing a proper launch plan for the event. 
Had the launch gone better, I could have had additional buy-in from the Meal Exchange volunteers as well as from my professor. 

**Plan your initial launch**

***

A launch plan was not discussed until I had completed feature implementation. 
This lead to a lack of contingencies and ultimately the failure. 
With more time, we could have found dedicated participants that were guaranteed to show up. 
We could have advertised the app alongside the normal advertisement for the event.
We could have trained event staff on how to use and promote the app. 
We could have done live test runs with focus groups. 
All of this would have lead to a higher chance of having a successful launch. 
It was an important lesson that I'm glad I learned with relatively low consequences.

**If you're going to fail, fail gracefully**

***
  
This lesson can be applied to all aspects of software engineering. 
On the technical side, there is always a chance of a network connection timing out, the database getting bogged down or an old resource version being cached on the client side. 
From a business perspective, people get taken off projects, planned features don't perform as well as predicted and development issues can delay app releases. 
In this case, app development went on for too long and the final app was untested. 
This was planned for by having the launch be done in tandom with a traditionally run event. 
This was planning for graceful failure, as I didn't want to risk the reputation of the local Meal Exchange chapter, as well as the large contribution to the local food bank made by Trick or Eat every year.
Despite the launch set backs, the event ran smoothly and the food bank got its food.     


*** 

In the end, I was able to build an app with real world requirements and see it through to a launch. 
I learned a ton and it was a good introduction to creating something from nothing to solve a need. 
