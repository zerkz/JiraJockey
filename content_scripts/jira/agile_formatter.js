var goalLine1    = 'Goal Line'
  , goalLine2    = '-----------------------------------------------GOAL LINE-----------------------------------------------'
  , goalSelector = 'div[title="' + goalLine1 + '"] span, div[title="' + goalLine2 + '"] span'
  , poller       = new Poller();

poller.addFunc(formatGoal);
poller.addFunc(updateSprintData);
poller.addFunc(shadeTickets);

// start the poller
poller.start()


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

// shade completed issues
function shadeTickets () {
  if (mouseDown) { return; }

  $('.aui-label:contains(BLOCKED)').closest('.js-issue').addClass('blocked');
	$('#ghx-backlog .ghx-done').closest('.js-issue').addClass('done');
}

// adds info to each ticket, makes a request to get the sprint data if necessary
function updateSprintData () {
  if (mouseDown) { return; }

  var tickets = [];

  // build the ticket array
  // $('.ghx-sprint-group .js-issue:not(.ghx-done)').each(function () {
  $('.ghx-sprint-group .js-issue').each(function () {
    tickets.push($(this).data('issue-key'));
  });

  // for every non-completed ticket
  // $('.ghx-sprint-group .js-issue:not(.ghx-done)').map(function () {
  $('.ghx-sprint-group .js-issue').map(function () {
    var ticketId = $(this).data('issue-key');

    // get available data
    store.get(ticketId, function (data) {

      // if data was found, use it
      if (data && Object.keys(data).length) {
        formatTicket(ticketId, data); 
      
      // otherwise make a request for it
      } else {
        requestTicketData(tickets);
      }
    });
  });
}


//
//  HELPERS
//


//
// request ticket data
//
// make requestt to get relevant data for each ticket in the sprint. store the data and reformat the tickets
// keep request state to minimize requests made
var activeRequest = false;
function requestTicketData (ticketArray) {

  // if no tickets were found, no need to continue
  if (!ticketArray.length) { return; }

  // set up the query
  var jql   = 'key in ("' + ticketArray.join('","') + '")'
    , query = {
        jql        : jql,
        maxResults : 500
      }

  // only make the request if there isn't already an active one
  if (!activeRequest) {
    activeRequest = true;

    // make the request
    $.get('https://brander.atlassian.net/rest/api/2/search', query).done(function (response) {
      activeRequest = false;
      if (!(response && response.issues && response.issues.length)) { return; }

      // for each ticket returned
      _.each(response.issues, function (ticket) {
        storeTicket(ticket);
      });
    });
  }
  
}


//
// format ticket
//
// format the html of the ticket passed in
function formatTicket (id, ticketObj) {
  var data        = ticketObj[id]
    , ticket      = $('.js-issue[data-issue-key=' + id + ']:not(.formatted):not(#daily-goal)')
    , progressBar = ticket.find('.ghx-grabber');

  // if the ticket was not found, or is already formatted, exit
  if (!ticket.length) { return; }

  // add an image of the assignee
  // ticket.append('<img src="' + data.assignee.image + '" alt="' + data.assignee.name + '" title="' + data.assignee.name + '" class="avatar">');

  // color the ticket based on progress
  setProgressColor(progressBar, data.status.color);

  // set the backgroud color
  setTicketClass(ticket, data.status.name);

  // if there are subtasks, include them in teh progress bar
  var totalTasks = data.subtasks.length
    , height     = 30/totalTasks
    , style      = height + 'px';

  _.each(data.subtasks, function (subtask, index) {
    var identifier = '';

    // check if this was frontend or backend
    if (subtask.type === 'backend') {
      identifier = 'B';

    } else if (subtask.type === 'frontend') {
      identifier = 'F';
    }

    progressBar.append('<div class="subtask" name="' + index + '"" syle="height: ' + style + ' width: 10px;">' + identifier + '</div>');

    var currentTask = progressBar.find('[name=' + index + ']');
    currentTask.css('height', style);
    currentTask.css('margin-top', style * index);
    setProgressColor(progressBar.find('[name=' + index + ']'), subtask.status.color);
  });

  ticket.addClass('formatted');
}


//
// store ticket
//
// extract and reformat ticket data, and store it in the chrome local storage
function storeTicket (ticket) {
  var data = new Ticket({
        id         : ticket.key,
        type       : findValue(ticket, 'fields.issuetype.name'),
        assignee   : {
          name  : findValue(ticket, 'fields.assignee.displayName'),
          image : findValue(ticket, 'fields.assignee.avatarUrls', {})['32x32']
        },
        status : {
          name  : findValue(ticket, 'fields.status.name'),
          color : findValue(ticket, 'fields.status.statusCategory.colorName')
        },        
        subtasks : []
      });

  // iterate over the subtasks
  data.subtasks = _.map(findValue(ticket, 'fields.subtasks', []), function (subtask, index) {
    var taskData = {
          type   : 'unknown',
          status : {
            name  : findValue(subtask, 'fields.status.name', null),
            color : findValue(subtask, 'fields.status.statusCategory.colorName', null)
          }
        };

    // test if it's a frontend ticket
    if (/frontend|front\send|fe/i.test(subtask.summary)) {
      taskData.type = 'frontend';

    // test if its a backend ticket
    } else if (/backend|back\send|be/i.test(subtask.summary)) {
      taskData.type = 'backend';
    }

    // return useful data
    return taskData
  });

  var ticketData = {};
  ticketData[data.id] = data;
  store.set(ticketData);
  formatTicket(data.id, ticketData);
}

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


function setTicketClass (ticket, status) {
  console.warn(status);
  if (/in\s*code\s*review/i.test(status)) {
    ticket.addClass('in-review');

  // in progess
  } else if (/complete|closed|stage|deploy|qa/i.test(status)) {
    ticket.addClass('done');
  }
}

//
//
// FUNCTIONALITY AUGMENTATION
//
//

// (SPEED) - keep track of mouse status to prevent reformatting while moving tickes
// $('#ghx-backlog-column').on('mousedown', function () { console.log('settign mouse down'); mouseDown = true; });
// $('#ghx-backlog-column').on('mouseup', function () { console.log('settign mouse up'); mouseDown = false; });

$('body').on('mousedown', function () { console.log('settign mouse down'); mouseDown = true; });
$('body').on('mouseup', function () { console.log('settign mouse up'); mouseDown = false; });
