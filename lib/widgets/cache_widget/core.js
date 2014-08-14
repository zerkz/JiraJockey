//
// Jira Cache Widget
//
// self contained widget for displaying cached jira tickets
//
var jiraCacheWidget = {

  //
  // core load function. returns the html and any content scripts for the widget 
  //

  $$ : null,
  unload: function () {
    $('#jj-cache-widget').remove();
    jiraCacheWidget.$$ = null;
  },
  load : function (container) {
    //
    // load the base html
    //
    var baseHtml = '<div id="jj-cache-widget">' + 
                    '<div class="header">' + 
                      '<div class="tab" id="user-tab">User Assigned</div>' +
                      '<div class="tab active" id="agile-tab">Agile Board</div>' +
                    '</div>' +
                    '<div class="content"></div>' +
                  '</div>';

    //
    // load and cache the widget added to the body
    //
    $(container).append(baseHtml);
    var $$ = jiraCacheWidget.$$ = $('#jj-cache-widget');

    jiraCacheWidget.renderCache('agile-tab');

    //
    // set up the listeners
    //

    // on a tab click
    $$.find('.tab').click(function (event) { 
      var cacheId = $(this).attr('id'); 

      // switch the active tab
      $$.find('.tab.active').removeClass('active');
      $$.find(this).addClass('active');

      jiraCacheWidget.renderCache(cacheId);
    });
  },


  //
  // render the content for a given cache
  //
  renderCache : function (cacheId) {
    if (!jiraCacheWidget.$$) { return; }

    var $$       = jiraCacheWidget.$$
      , $content = $$.find('.content');

    // empty content and add loading message
    $content.empty();
    $content.append('<div style="width: 100px; margin: auto; padding: 50px; text-align:center;">loading...' + cacheId + '</div>');

    // load the appropriate ticket set, and display it
    if (/user/.test(cacheId)) {
      getUserCache(buildCacheDisplay);

    } else if (/agile/.test(cacheId)) {
      getAgileCache(buildCacheDisplay);
    }

    function buildCacheDisplay (tickets) {
      $content.empty();
      
      tickets = jiraCacheWidget.sortTickets(tickets);

      _.each(tickets, function (ticket) {
        var html = ticketToHtml(ticket);
        $content.append(html);
      });


    // on ticket click
    $$.find('.summary-bar').on('click', function (event) {
      var $this  = $(this).closest('.issue').find('.details')
        , active = $this.hasClass('active')

      if (!active) {
        $this.addClass('active');
      } else {
        $this.removeClass('active');
      }
    });
    }

    // take a ticket and get the html
    function ticketToHtml (ticket) {
      ticket = ticket || {};
console.log(ticket)
      var key          = ticket.key || ''
        , summaryText  = get('fields.summary')
        , epic         = get('')
        , statusColor  = get('fields.status.statusCategory.colorName', true)
        , status       = get('fields.status.statusCategory.name', true).toLowerCase()
        , workflow     = get('fields.status.name', true).toLowerCase()
        , workflowId   = get('fields.status.name', true).toLowerCase()
        , storyPoints  = get('fields.customfield_10103')
        , issueTypeImg = get('fields.issuetype.iconUrl')
        , priorityImg  = get('fields.priority.iconUrl')
        , assigneeImg  = get('fields.assignee.avatarUrls.48x48')
        , assigneeName = get('fields.assignee.displayName')
        , reporterName = get('fields.reporter.displayName')
        , priorityName = get('fields.priority.name')
        , timeSpent    = (get('fields.aggregatetimespent') || 0) /60
        , PR           = get('fields.customfield_12400') || 'none'
        , description  = (get('fields.description') || 'No description available').replace(/\n/g, '</br>')

      var summary = '<div class="summary-bar ' + workflowId + ' ' + status + ' ">' + 
                      '<div class="status-color ' + statusColor + '"></div>' +
                      '<div class="type"> <img src="' + issueTypeImg + '"> </div>' +
                      '<div class="priority"> <img src="' + priorityImg + '"> </div>' +
                      '<div class="ticketId"> <a href="https://brander.atlassian.net/browse/' + key + '"" class="key">' + key + '</a> </div>' +
                      '<div class="summary">' + summaryText + '</div>' +
                      '<div class="epic">' + epic + '</div>' +
                      '<div class="story-points">' + storyPoints + '</div>' +
                      '<img src="' + assigneeImg + '" alt="' + assigneeName + '" class="avatar">' +
                    '</div>';

      var details = '<div class="details">' +
                      '<div class="content">' +
                        '<div class="headers">' +
                          '<label>Status:</label> <span>' + workflow + '</span>' +
                          '<label>Reporter:</label><span>' + reporterName + '</span>' + 
                          '<label>Priority:</label><span>' + priorityName + '</span>' +
                        '</div>' +
                        '<div class="headers">' +
                          '<label>Time Loggged:</label><span>' + timeSpent + 'm</span>' + 
                          '<label>PR:</label> <span>' + PR + '</span>' +
                        '</div>' +
                        '<div class="section">' +
                          description
                        '</div>' +
                      '</div>' +
                    '</div>';

      return '<div class="issue" key="' + key + '">' + summary + details + '</div>';

      //
      // helpers
      //

      function get (prop, asId) {
        var val = findValue(ticket, prop) || ''
        return asId ? val.replace(/\s+/g, '-') : val;
      }
    }
  },

  //
  // sort tickets byt status, then by project
  //
  sortTickets : function (tickets) {
    var open = [];
    var inReview = [];
    var complete = [];

    _.each(tickets, function (ticket) {
      var status   = findValue(ticket, 'fields.status.statusCategory.name', '').replace(/\s+/g, '-').toLowerCase()
        , workFlow = findValue(ticket, 'fields.status.name', '').replace(/\s+/g, '-').toLowerCase();

      if (status === 'complete') {
        open.push(ticket);
      } else if (workFlow === 'in-code-review') {
        inReview.push(ticket);
      } else {
        complete.push(ticket);
      }
    });

    var result = complete;
    result = result.concat(inReview);
    result = result.concat(open);
    return result;
  }
}