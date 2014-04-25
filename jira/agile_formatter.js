var goalLine1    = 'Goal Line'
  , goalLine2    = '-----------------------------------------------GOAL LINE-----------------------------------------------'
  , goalSelector = 'div[title="' + goalLine1 + '"] span, div[title="' + goalLine2 + '"] span'
  , poller       = new Poller();

poller.addFunc(formatGoal);
poller.addFunc(shadeTickets);

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
	$('.ghx-meta  .ghx-done').closest('.js-issue').addClass('done')
}
