JiraJockey
==========

To add to chrome, go to `menu > settings > extensions` check the `Develper mode` box. then  select `Load unpacked extension` and load the JiraJockey directory

To enable the cache to store your agileboard, go to the options page in the chrome extensions settings, and enter the agile board ID where prompted

Functionality
=============

* Jira Cache
  * ~~a half hour long cache of the agile board and use tickets is polled/updated through a background script. it is set to diplay if jira is down, or it is accessible through the options page broken~~

* Agile Board
  * Converts in sprint open ticket ticket id bar to a progress bar of sub tasks
  * Adds the photo of the assignee to the ticket entry
  * Shades resolved tickets as grey
  * Shades in code review tickets as orange
  * Shades ready for QA tickets as green
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

* localhost:*
  * Adds a `populate` button to the bottom of localhost pages. Using internal key-value pairs, it fills in forms on the page. _NOTE 1:_ its works with localizations. _NOTE 2:_ please update key value pairs as new ones are discovered. especially non-english

To Do
=====

* locaclhost:*
 * remove populate by default, add it to the options page to enable 
 
* Global
 * add tools button to toolbar, containing various utils
    * url (with QS) to object translator

* Home
 * add home page to list open PR's, and tickets assigned to you in the sprint. possibly using the [Github API] (https://developer.github.com/v3/pulls/)

* Jira
 * add buttons to hover to quickly navigate the agile board when moving tickets
 * shade tickets with 'is blocked by' attribute
 * ctrl + up or down - move the currently selected items to the preceding or following box

* Git
 * color the blocked status purple, with teh blocked epic
 * __high-priority__ add logic to close tickets and assign to user
 * add pop up for open PR's in watched repo's 
 * Add post PR option to new PR submissions
 * Disable submit PR button if console logs or writefiles are detected

* json
 * persistant focus on a subprop accross page loads


**Shout out to Adam Bretz for the name**
