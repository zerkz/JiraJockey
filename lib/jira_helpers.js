//
//
// Api helpers
//
//

var jiraAPI = {
      //
      // get object representataion of the logge din user
      //
      getCurrentUser : function (callback) {
        $.get('https://jira.brandingbrand.com/rest/gadget/1.0/currentUser').done(callback);
      },

      //
      // get a detailed list of the tickets from the agile board
      //
      getAgileTickets : function (callback, rapidViewId) {
        // key off the provided rapidViewId is possible
        if (rapidViewId) {
          ticketsFromId(rapidViewId);

        // otherwise try to get one from the store
        } else {
          STORE.get('rapidViewId', ticketsFromId);
        }

        function ticketsFromId (id) {
          jiraAPI.getAgileBoardSummary(id, function (agileSummary) {
            var ticketList = _.compact(_.map(agileSummary, function (ticket, index) {
                  if (index < 75) {
                    return ticket.key;
                  }
                }));

            // use the summary to get a detailed list
            jiraAPI.getTickets(ticketList, function (tickets) {
              var ticketMap = {};
              _.each(tickets.issues, function (ticket) {
                ticketMap[ticket.key] = ticket;
              });

              orderedTickets = _.map(ticketList, function (key) {
                return ticketMap[key];
              });

              callback(orderedTickets);
            });
          });
        }
      },

      //
      // get a detailed list of tickets assigned to the user
      //
      getUserTickets : function (callback, userName) {
        // if a username was passed in, make the request using it
        if (userName) {
          userTicketReq(userName);

        // if no request was passed in, retrieve it and pass it along
        } else {
          jiraAPI.getCurrentUser(function (userData) {
            userTicketReq(userData.username);
          });
        }

        // take a username and retrieve the relevant tickets
        function userTicketReq (assignee) {
          var assignee = 'assignee=' + assignee
            , filter   = '('
                           + 'status="in progress"'
                           + ' OR status="open"'
                           + ' OR status="reopened"'
                           + ' OR status="in code review"'
                          + ')';

        var query = {
              jql        : assignee,
              maxResults : 500
              // jql : assignee + ' AND ' + filter 
            };

            $.get('https://jira.brandingbrand.com/rest/api/2/search', query).done(function (response) {
            callback(response && response.issues);
          });
        }
      },

      //
      // get a shorthand list of tickets on the agile board (used in standard html display)
      //
      getAgileBoardSummary : function (rapidViewId, callback) {
          $.get('https://jira.brandingbrand.com/rest/greenhopper/1.0/xboard/plan/backlog/data.json?rapidViewId=' + rapidViewId).done(function (response) {
            return callback(response && response.issues);
          });
      },

      //
      // take an array of ticket ID's and get detailed info
      //
      getTickets : function (tickets, callback) {
         var jql  = 'key in ("' + tickets.join('","') + '")'
          , query = {
              jql        : jql,
              maxResults : 500
            };

          $.get('https://jira.brandingbrand.com/rest/api/2/search', query).done(callback);
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
function updateAgileCache (callback, tickets, rapidViewId) { 
  // use tickets, if provided
  if (tickets && tickets.length) {
      updateJiraCache('SprintCache', tickets);

  // otherwise, make a request for them
  } else {
    jiraAPI.getAgileTickets(function (tickets) {
      updateJiraCache('SprintCache', tickets);
    }, rapidViewId);
  }
}

//
// sharedcache update utility
//
function updateJiraCache (cacheName, tickets, ticketRequest, callback) {
  if (tickets) {
    cache.set(cacheName, tickets, HALF_HOUR, callback);

  // if data was returned, update the cache
  } else {
    ticketRequest(function (results) {
      if (results.length) {
        cache.set(cacheName, results, HALF_HOUR, callback);   
      }   
    });
  } 
}