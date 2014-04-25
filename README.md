JiraJockey
==========

To add to chrome, go to `menu > settings > extensions` check the `Develper mode` box. then  select `Load unpacked extension` and load the JiraJockey directory

Functionality
=============

* Agile Board
  * shades resolved tickets
  * sets the goal line as gold bar
* GitHub
  * Changes ticket in title to link to jira ticket 
  * Added a box to the bottom of the first comment in the PR comtaining the commands to pull the pr
  * Converts localhost links in comments to clickable links, displaying only the path
 
* Poller
  * all style changes listed above will execute every tenth of a second for 30 seconds to accommadate for AJAX requests and restyling in both Jira and Git
  * after two minutes of inactiviy on the page, the poller will cease
  * the timer is reset on a mouse move event

To Do
=====

* Jira
 * Shade blocked tickets
 * Automatically post PR links in the comments of a jira ticket when one is submitted

* json
 * persistant focus on a subprop accross page loads


**Shout out to Adam Bretz for the name**
