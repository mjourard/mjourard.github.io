---
layout: post
title: "What Was Trick or Eat"
---

* blurb about the food insecurity problem in Canada


* blurb about Meal Exchange and the Trick or Eat event

Meal Exchange is a nationally-recognized Canadian non-profit charity which coordinates student volunteers on university campuses in an effort to fight food insecurity across Canada. 
Meal Exchange supports community-driven solutions such as food banks, campus kitchens, gardens and farms. 
They also provide mentorship and resources, connect students with their peers across the country, and provide a single point of contact for provincial and national stakeholders in business, civil society and media.

Trick or Eat is Meal Exchange's Halloween food drive, in which student volunteers go door-to-door on Halloween collecting non-perishable food to give to a local food bank.

While the event is a fun time and was extremely effective at Guelph (TODO: find total amount of food raised in final years and put here), it was always a hectic start.
The following had to happen in order for someone to participate in the event:
1. They'd sign a waiver. A typical liability release form for off-campus school activities
2. They'd join a team, typically in tandom with their teammates
3. Their team would be assigned a collection route and bus number, which they'd receive on an already printed-out sheet of paper. 
The route was a residential route they'd walk with a shopping cart and their team, knocking on the doors of all the houses on the route and collecting generous donations from the residents.
The bus was a chartered school bus that would take them to the drop-off point of their "zone" (a collection of routes with a central pick-up and drop-off point)
    a. Note: All of these houses had flyers delivered with opt-out information delivered to them at least 2 weeks in advance by event volunteers
4. They'd sit around for ~20 minutes and wait for their bus to start boarding, as notified by event staff via megaphone.
5. Once the bus finished boarding, it departs for their dropoff location, in which they complete their route and return to pickup location with their shopping cart full of non-perishable food items.

Each of the above steps is very chaotic when done in a relatively small, loud space with the medium of information transfer being paper. The Trick or Eat app was intended to make running the event easier,
while also ensuring information transfer from year to year was made easier.

Year to year information transfer means all of the following:
1. Contacting participants from previous years
2. Passing along route information
    a. the actual route itself
    b. amount of food collected in each route
    c. any issues with the route to be fixed or avoided next year
3. Collected participant feedback

So, sponsored development through a grant was kicked off in 2015(?). I was handed off the project after they ran out of funding and a strong skeleton for the front end, backend and database structure was produced.  

* blurb about developing Trick or Eat  

The development instructions I received were to do it right the first time so that it wouldn't have to be redone all over again the second time. In theory this is sound advice, but in practice, it served to set the pace far too slow to be practical. At the time, I was a third/fourth year student with 4 semesters of development co-op under my belt. I was a barely junior-level software developer, learning three new frameworks and working on my own. 
This was a recipe for failure, as I tried to learn how to do AngularJS and Silex development the **right** way, while adding Functional tests through PHPUnit. I often fell down rabbit holes, losing hours at a time on small problems that I could have hacked around with minimal long-term consequences. 

The Trick or Eat app stack is made of Nginx, AngularJS, PHP + Silex and MySQL, sitting on a linux box:

![image]({{ site.url }}/assets/img/toe_techstack.svg)  

As I was developing it, I added functional tests of the API using PHPUnit for easier verification of the backend api meeting requirements, as well as codifying the requirements that were produced. I also added a **docker-compose** script for easier creation of the development environment, as I hoped I would not be the last developer to work on it, and setting up an OS-agnostic development environment is 1000x easier with docker than without.

All of these extra non-feature tasks that I completed did slow down core development, however that was a choice made after missing the first deadline of 2 months after inheriting the app's skeleton for the Halloween of that year.

Progress to feature completion was gradual and finished by the halloween of the following year.

* blurb about final execution

When launching a new app, it is important to have clear lines of communication with your primary stakeholders. At the time, this responsibility was delegated to the professor overseeing the development side of the app. This prof is a recovering work-a-holic, and oversaw many research projects and student independent study units. Also at the time, I was juggling other classes and extra-curricular activities. For these reasons, communication lines between myself and the event organizers fell flat, and we were not able to do any practice load tests of the app. I was also unable to get direct feedback from potential participants, so there was a good chance I was missing something obvious with usability.

Thankfully, the event organizers were veteran participants themselves, and they each had disability awareness training from the University of Guelph, so when they told me it ticked all the requirements for usability, performance and feature completion, I was confident we'd be able to have a successful first run. Still, I did not want to risk the success of the event on an app I wasn't able to do mock load testing on with the skillset I had at the time, so we agreed that they would prepare the event to be run traditionally, with a select few teams trying the app during the event.

They had arranged for a large group of 30 people from a single residence on campus to test the app during the event. Unfortunately, on the day of the event, none of them showed up. I was heart broken, and managed to get two random participants to agree to use the app during the event. They however, did not report back. 

All in all, the app test launch was a ~~failure~~ large opportunity for learning.   

* After math



* final takeaways

