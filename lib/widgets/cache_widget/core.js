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
console.log('wat')
    // load the appropriate ticket set, and display it
    if (/user/.test(cacheId)) {
      getUserCache(buildCacheDisplay);

    } else if (/agile/.test(cacheId)) {
      getAgileCache(buildCacheDisplay);
    }

    function buildCacheDisplay (tickets) {
      $content.empty();
      _.each(tickets, function (ticket) {
        var html = ticketToHtml(ticket);
        $content.append(html);
      });
    }

    // take a ticket and get the html
    function ticketToHtml (ticket) {
      ticket = ticket || {};

      var key          = ticket.key || ''
        , summaryText  = get('fields.summary')
        , epic         = get('')
        , statusColor  = get('fields.status.statusCategory.colorName', true)
        , workflow     = get('fields.status.name', true)
        , storyPoints  = get('fields.customfield_10103')
        , issueTypeImg = get('fields.issuetype.iconUrl')
        , priorityImg  = get('fields.priority.iconUrl')
        , assigneeImg  = get('fields.assignee.avatarUrls.48x48')
        , assigneeName = get('fields.assignee.displayName')
console.log(statusColor)

      var summary = '<div class="summary-bar ' + workflow + '">' + 
                      '<div class="status-color ' + statusColor + '"></div>' +
                      '<div class="type"> <img src="' + issueTypeImg + '"> </div>' +
                      '<div class="priority"> <img src="' + priorityImg + '"> </div>' +
                      '<div class="ticketId"> <a href="https://brander.atlassian.net/browse/' + key + '"" class="key">' + key + '</a> </div>' +
                      '<div class="summary">' + summaryText + '</div>' +
                      '<div class="epic">' + epic + '</div>' +
                      '<div class="story-points">' + storyPoints + '</div>' +
                      '<img src="' + assigneeImg + '" class="avatar">' +
                    '</div>';

      var details = '<div class="details">' +
                    '</div>';

      return '<div class="issue" key="' + key + '">' + summary + details + '</div>';

      function get (prop, asId) {
        var val = findValue(ticket, prop, '')
        return asId ? val.replace(/\s+/, '-') : val;
      }
    }
  },
}