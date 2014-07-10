JiraJockey
==========

To add to chrome, go to `menu > settings > extensions` check the `Develper mode` box. then  select `Load unpacked extension` and load the JiraJockey directory

Functionality
=============

* Agile Board
  * Converts in sprint open ticket ticket id bar to a progress bar of sub tasks
  * Adds the photo of the assignee to the ticket entry
  * Shades resolved tickets as grey
  * Sets the goal line as gold bar
  * Shades tickets in the blocked epic as purple
 
* GitHub
  * Changes ticket in title to link to jira ticket 
  * Added a box to the bottom of the first comment in the PR comtaining the commands to pull the pr
  * Converts localhost links in comments to clickable links, displaying only the path
 
* Poller
  * all style changes listed above will execute every tenth of a second for 30 seconds to accommadate for AJAX requests and restyling in both

* Jira and Git
  * after two minutes of inactiviy on the page, the poller will cease
  * the timer is reset on a mouse move event

To Do
=====

* Global
 * add tools button to toolbar, containing variout utils
  * url (with QS) to object translator

* Home
 * add home page to list open PR's, and tickets assigned to you in the sprint 

* Jira
 * shade tickets with 'is blocked by' attribute
 * set progress to orange if it is in the code review state
 * ctrl + up or down - move the currently selected items to the preceding or following box

* Git
 * add pop up for open PR's in watched repo's 
 * Add post PR option to new PR submissions
 * Disable submit PR button if console logs or writefiles are detected

* json
 * persistant focus on a subprop accross page loads


**Shout out to Adam Bretz for the name**
