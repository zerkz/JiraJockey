//
//
// Api helpers
//
//

var jiraAPI = {
  getAgileTickets : function () {

  },

  getUserTickets : function (callback) {
    // chrome.cookies.getAllCookieStores(
    // // {
    // //   url  : 'brander.atlassian.net/', 
    // //   // name : 'AJS.conglomerate.cookie'
    // // }, 
    // function (cookie) {
    //   console.log(cookie);
    // });
console.log(document.cookie)


    var assignee = 'assignee=john.hofrichter'
      , filter   = '('
                     + 'status="in progress"'
                     + ' OR status="open"'
                     + ' OR status="reopened"'
                     + ' OR status="in code review"'
                    + ')';

  var query = {
        jql : assignee + ' AND ' + filter 
      }

    $.get('https://brander.atlassian.net/rest/api/2/search', query).done(function (response) {
      callback(response && response.issues);
    });
  }
}


//
//
// Caching helpers
//
//


// User
function getUserCache (callback) { cache.get('UserCache', callback); }
function updateUserCache (callback, tickets) { updateJiraCache('UserCache', tickets, jiraAPI.getUserTickets, callback); }

// sprint
function getAgileCache (callback) { cache.get('SprintCache', callback); }
function updateAgileCache (callback, tickets) { updateJiraCache('SprintCache', tickets, jiraAPI.getAgileTickets, callback); }

//
// sharedcache update utility
//
function updateJiraCache (cacheName, tickets, ticketRequest, callback) {
  if (tickets) {
    cache.set(cacheName, tickets, callback);

  // if data was returned, update the cache
  } else {
    ticketRequest(function (results) {
      if (results.length) {
        cache.set(cacheName, results, callback);   
      }   
    });
  } 
}