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
                    '<div class="content" id="jj-cache-widget-content"></div>' +
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
    $content.append('<div style="width: 100px; margin: auto; padding: 50px; text-align:center;">loading...</div>');

    // load the appropriate ticket set, and display it
    if (/user/.test(cacheId)) {
      getUserCache(buildCacheDisplay);

    } else if (/agile/.test(cacheId)) {
      getAgileCache(buildCacheDisplay);
    }

    function buildCacheDisplay (cache) {
      cache = cache || {};

      var time     = new Date(cache.timeSet || 0) || 'error'
        , tickets  = cache.value || {}
        , timeHtml = '<div class="expire-time">Cache set at - ' + time + '</div>';

      $content.empty();

      // only sort if its the user cache
      if (/user/.test(cacheId)) {
        tickets = jiraCacheWidget.sortTickets(tickets);
      } 

      // if no tickets were returned, and its the agile cache. print a notification and return
      if (/agile/.test(cacheId) && !tickets.length) {
        var message = 'No tickets found in the agile cache. make sure you set an agile board ID for JiraJockey to key off of. ' +
                      'go to chrome-settings > extensions > jirajockey > options. there is a prompt on the options page for an ID';

        document.getElementById('jj-cache-widget-content').innerHTML = message;
        return;
      }

      var ticketBlock = _.map(tickets, ticketToHtml).join(' ');

      // JQuery has performance issues with large block of html. simply use document
      document.getElementById('jj-cache-widget-content').innerHTML = timeHtml + ticketBlock;

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


    //
    //
    // take a ticket and get the html
    function ticketToHtml (ticket) {
      if (!(ticket && Object.keys(ticket))) { return ''; }
      
      // sadly, finValue is prohibitively slow here. so a block if statement will have to do
      var key = summaryText = statusColor = status = workflow = workflowId = storyPoints = issueTypeImg = '';
      var priorityImg = assigneeImg = assigneeName = reporterName = priorityName = timeSpent = PR = description = '';

      ticket.fields = ticket.fields || ticket;
      if (ticket.fields) {
        var fields      = ticket.fields
        
        key         = ticket.key;
        timeSpent   = fields.aggregatetimespent || '';
        PR          = fields.customfield_12400 || 'none';
        description = (fields.description || 'No description available').replace(/\n/g, '</br>');


        if (fields.status) {
          var status = fields.status;
          workFlow = status.name;
          workflowId  = status.name.toLowerCase().replace(/\s+/g, '-');

          if (status.statusCategory) {
            statusCategory = status.statusCategory
            statusColor    = (statusCategory.colorName || '').replace(/\s+/g, '-')
            status         = (statusCategory.name || '').toLowerCase().replace(/\s+/g, '-')
          }
        }

        if (fields.summary) { summaryText = fields.summary; }
        if (fields.customfield_10103) { storyPoints = fields.customfield_10103 }
        if (fields.issuetype && fields.issuetype.iconUrl) { issueTypeImg = fields.issuetype.iconUrl }
        if (fields.priority && fields.priority.iconUrl) { priorityImg = fields.priority.iconUrl }
        if (fields.reporter && fields.reporter.displayName) { reporterName = fields.reporter.displayName }
        if (fields.priority && fields.priority.name) { var priorityName = fields.priority.name }

        if (fields.assignee) {
          var assignee    = fields.assignee
          
          assigneeImg = assignee.displayName || ticket.avatarUrl
          if (assignee.avatarUrls) { assigneeImg = assignee.avatarUrls['48x48'] }
        }
      }

      // fallbacks 
      if (!storyPoints && ticket.estimateStatistic && ticket.estimateStatistic.statFieldValue) { 
        storyPoints = ticket.estimateStatistic.statFieldValue.text;
      }

      if (!status) {
        if (!/(to\s*do|re\s*opened|re*opened|open|new|in\s*progress)/i.test(ticket.statusName)) {
          status = 'complete';
        }
      }

      if (!priorityImg) {
        priorityImg = ticket.priorityUrl;
      }

      if (!issueTypeImg) {
        issueTypeImg = ticket.typeUrl
      }

      var timeSpent = msToTimeObj(timeSpent);

      // build the html
      var summary = '<div class="summary-bar ' + workFlowStatus(workflowId) + ' ' + status + ' ">' + 
                      '<div class="status-color ' + statusColor + '"></div>' +
                      '<div class="type"> <img src="' + issueTypeImg + '"> </div>' +
                      '<div class="priority"> <img src="' + priorityImg + '"> </div>' +
                      '<div class="ticketId"> <a href="https://jira.brandingbrand.com/browse/' + key + '" class="key">' + key + '</a> </div>' +
                      '<div class="summary">' + summaryText + '</div>' +
                      '<div class="story-points">' + (storyPoints || '') + '</div>' +
                      '<img src="' + assigneeImg + '" alt="' + assigneeName + '" class="avatar">' +
                    '</div>';

      var details = '<div class="details">' +
                      '<div class="content">' +
                        '<div class="headers">' +
                          '<label>Status: <span>' + (workFlow || 'unknown') + '</span></label>' +
                          '<label>Reporter:<span>' + reporterName + '</span></label>' + 
                          '<label>Priority:<span>' + priorityName + '</span></label>' +
                          '<label>Time Loggged:<span>' + timeSpent.minutes + 'm</span></label>' + 
                          '<label>PR:<span>' + PR + '</span></label>' +
                        '</div>' +
                        '<div class="section">' +
                          description +
                        '</div>' +
                      '</div>' +
                    '</div>';

      return '<div class="issue" key="' + key + '">' + summary+ details + '</div>';
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

      if (workFlow === 'in-code-review') {
        inReview.push(ticket);
      } else if (!/(open|blocked|in\s*progress|in-progress|reopened)/i.test(workFlow)) {
        open.push(ticket);
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

//
// take a workflow and tranlate it into the appropriate class
//
function workFlowStatus (workFlow) {
  if (/in-code-review/.test(workFlow)) {
    return 'in-code-review';
  } else if (!/(open|blocked|in\s*progress|in-progress|reopened)/i.test(workFlow)) {
    return 'complete';
  }
}