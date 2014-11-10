var goalLine1    = 'Goal Line'
  , goalLine2    = '-----------------------------------------------GOAL LINE-----------------------------------------------'
  , goalSelector = 'div[title="' + goalLine1 + '"] span, div[title="' + goalLine2 + '"] span'
  , poller       = new Poller();

// get the agile board to update the cache, since the cache is used in ticket shading
var rapidBoardId = (window.location.search.match((/rapidView=(\d+)/)) || [] ) [1];

// overwrite old summary
jiraAPI.getAgileBoardSummary(rapidBoardId, function (tickets) {
    STORE.set('agileSummary', tickets);
  });

poller.addFunc(formatGoal);
poller.addFunc(updateTicketFormatting);
poller.addFunc(addUtilities);
poller.addFunc(widgetLoader);
// poller.addFunc(warnNoStoryPoint);

// start the poller
poller.start();

//
//  POLLER FUNCTIONS
//

// only execucte if the mouse is up
var mouseDown;

//format the daily goal
function formatGoal () {
  if (mouseDown) { return; }

  var dailyGoal = $(goalSelector).closest('.js-issue');
  dailyGoal.empty();
  dailyGoal.attr('id', 'daily-goal');
  dailyGoal.text('Daily Goal');
}

function addUtilities () {

  //
  // hide complete utlility
  //
  if (!$('#hide-complete').length) {
    STORE.get('hide-complete', function (checked) {
      var checked = checked ? 'checked' : ''
      checked ? $('.js-issue-list').addClass('hide-complete') : $('.js-issue-list').removeClass('hide-complete')
      var hideCheckBox = '<div id="hide-complete">' +
                            '<input type="checkbox" ' + checked + '>' +
                            '<label>hide completed issues<label>' +
                          '</div>';

      $('.ghx-assigned-work-stats').append(hideCheckBox);

      // set up the listeners to handle updating the store and container
      var $hideComplete = $('#hide-complete input')
        , $container    = $('.js-issue-list')

      $hideComplete.on('click', function () {
        var isChecked = this.checked;
        STORE.set('hide-complete', isChecked);
        isChecked ? $container.addClass('hide-complete') : $container.removeClass('hide-complete')
      });
    });
  }
}

// adds info to each ticket, makes a request to get the sprint data if necessary
function updateTicketFormatting () {
  if (mouseDown) { return; }

  STORE.get('agileSummary', function (tickets) {
    _.each(tickets || [],  formatTicket);
  });
}

function widgetLoader () {
  // if jira is down, append the cache widget
  if($('#notifications h1:contains(Page unavailable)').length && !$('#jj-cache-widget').length) {
    jiraCacheWidget.load('#notifications');
  }
}

//
//  HELPERS
//



//
// format ticket
//
// format the html of the ticket passed in
function formatTicket (ticket) {
  if (!Object.keys(ticket).length) { return; }

  // get the useful data from the ticket
  var key         = ticket.key
    , statusName  = findValue(ticket, 'statusName')
    , statusColor = findValue(ticket, 'status.statusCategory.colorName')
    , subtasks    = _.map(findValue(ticket, 'subtasks', []), function (subtask, index) {
        return findValue(subtask, 'status.statusCategory.colorName', null)
      });


  var ticket      = $('.js-issue[data-issue-key=' + key + ']:not(.formatted):not(#daily-goal)')
    , progressBar = ticket.find('.ghx-grabber');

  // color the ticket based on progress
  setProgressColor(progressBar, statusColor);

  // set the progress bar for multiple subtasks
  setProgressBarSubtasks(progressBar, subtasks);

  // set the backgroud color
  setTicketClass(ticket, statusName);
}

//
// add a class to set the progress color of a provided ticket
function setProgressColor (node, color) {
  if (/blue-gray/i.test(color)) {
    node.css('background-color', '#4a6785');
    node.css('color', 'white');

  // in progess
  } else if (/yellow/i.test(color)) {
    node.css('background-color', '#f6c342');

  // done
  } else {
    node.css('background-color', '#14892c');
    node.css('color', 'white')
  }
}

//
// add divs for each subtask to the progress bar
function setProgressBarSubtasks (node, subtasks) {
  // if there are subtasks, include them in teh progress bar
  var height     = 30/subtasks.length
    , style      = height + 'px';

  _.each(subtasks, function (subtask, index) {
    node.append('<div class="subtask" name="' + index + '"" syle="height: ' + style + ' width: 10px;"></div>');

    var currentTask = node.find('[name=' + index + ']');
    currentTask.css('height', style);
    currentTask.css('margin-top', style * index);
    setProgressColor(node.find('[name=' + index + ']'), color);
  });
}

//
// set the status of a provided ticket
function setTicketClass (ticket, status) {
  // in code review
  if (/in\s*code\s*review/i.test(status)) {
    ticket.addClass('in-review');

  } else if (/qa.*stage/i.test(status)) {
    ticket.addClass('in-qa');

  // in progess
  } else if (/complete|closed|stage|deploy|qa/i.test(status)) {
    ticket.addClass('done');

  // blocked
  } else if (ticket.find('.aui-label:contains(BLOCKED)').length) {
    ticket.addClass('blocked');
  }
}

//
// add warning on ticket page without story points
function warnNoStoryPoint () {
  if (/jira\.brandingbrand\.com\/browse/.test(window.location.href)) {
    if (!$('[title="Story Points"]').length) {

      if ($('.no-story-point-warn').length) { return; }

      var $warningMessage = $('<ul class="toolbar-group pluggable-ops no-story-point-warn"><li class="toolbar-item"><a id="edit-issue" class="toolbar-trigger"><span class="warn-left-arrow"></span><span class="trigger-label">Please Add Story Point</span></a></li></ul>');
      $warningMessage.find('a')
        .css({
          'border': '1px solid #d04437',
          'background': '#d04437',
          'point-event': 'none',
          'position': 'relative',
          'color': '#fff',
          'text-shadow': 'none'
        });
      $warningMessage.find('.warn-left-arrow')
        .css({
          'border-top': '7px solid transparent',
          'border-bottom': '7px solid transparent',
          'border-right': '7px solid #d04437',
          'display': 'inline-block',
          'position': 'absolute',
          'left': '-8px',
          'top': '7px'
        });

      $('.toolbar-group').first().after($warningMessage);

    }
  }
}

//
//
// FUNCTIONALITY AUGMENTATION
//
//

// (SPEED) - keep track of mouse status to prevent reformatting while moving tickes
$('body').on('mousedown', function () { mouseDown = true; });
$('body').on('mouseup', function () { mouseDown = false; });
