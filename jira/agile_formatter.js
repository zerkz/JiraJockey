var goalLine1    = 'Goal Line'
  , goalLine2    = '-----------------------------------------------GOAL LINE-----------------------------------------------'
  , goalSelector = 'div[title="' + goalLine1 + '"] span, div[title="' + goalLine2 + '"] span'
  , poller       = new Poller();

poller.addFunc(formatGoal);
poller.addFunc(shadeTickets);
poller.addFunc(updateSprintData);

// start the poller
poller.start()

//format the daily goal
function formatGoal () {
	var dailyGoal = $(goalSelector).closest('.js-issue');
	dailyGoal.empty();
	dailyGoal.attr('id', 'daily-goal');
	dailyGoal.text('Daily Goal');
}

// shade completed issues
function shadeTickets () {
  $('.aui-label:contains(BLOCKED)').closest('.js-issue').addClass('blocked');
	$('#ghx-content-group .ghx-done').closest('.js-issue').addClass('done');
}


function updateSprintData () {
  // for every non-completed ticket
  $('.ghx-sprint-group .js-issue:not(.ghx-done)').map(function () {
    var $this    = $(this)
      , ticketId = $this.data('issue-key');

    // get available data
    store.get(ticketId, function (data) {
      // if there is no up to date data
      if (!data || !Object.keys(data).length || (data && (currentTime() - data.timeStamp) > FIVEMIN)) {
        updateTicket(ticketId);
      } else {
        formatTicket(ticketId, data);
      }
    });
  });
}


//
//  HELPERS
//


function formatTicket (id, ticketObj) {
  var data        = ticketObj[id]
    , ticket      = $('.js-issue[data-issue-key=' + id + ']:not(.formatted):not(#daily-goal)')
    , progressBar = ticket.find('.ghx-grabber');

  // if the ticket was not found, or is already formatted, exit
  if (!ticket.length) { return; }

  // add an image of the assignee
  ticket.append('<img src="' + data.assignee.image + '" alt="' + data.assignee.name + '" class="avatar">');

  // color the ticket based on progress
  setProgressColor(progressBar, data.status.color);

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

// update the local storage and reformat the tickets
function updateTicket (ticket) {
  var query = {
        rapidViewId  : queryParams.rapidView,
        issueIdOrKey : ticket,
        loadSubtasks : true
      }

  $.get('https://brander.atlassian.net/rest/greenhopper/1.0/xboard/issue/details.json', query).done(function (response) {
    var ticketData = {}
      , data       = new Ticket({
          id         : ticket,
          type       : response.typeName,
          assignee   : {
            image : response.avatarUrl
          }
        });


      // iterate over the fields in the ticket
      _.each(response.fields, function (field, index) {

        // extract the assignee
        if (/assignee/i.test(field.id)) {
          data.assignee.name = field.html;

        // extract the ticket status
        } else if (/status/i.test(field.id)) {
          data.status.name  = field.text;
          data.status.color = findValue(field, 'statusEntry.statusCategory.colorName', null);
        }
      });
    

      // iterate over the subtasks
      data.subtasks = _.map(response.subtasks, function (subtask, index) {
        var taskData = {
              type   : 'unknown',
              status : {
                name  : findValue(subtask, 'status.name', null),
                color : findValue(subtask, 'status.statusCategory.colorName', null)
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

    ticketData[ticket] = data;
    store.set(data);
    formatTicket(data);
  })
}