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

    if (cacheId == 'user-tab') {
      getUserCache(function (tickets) {
        $content.empty();
        $content.append(tickets);
      });
    } else if (cacheId === 'agile-tab') {
      getAgileCache(function (tickets) {
        $content.empty();
        $content.append(tickets);
      });
    }
  },
}