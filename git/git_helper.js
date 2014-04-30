/////////////////////////////////////////////////////////////////////////////////////////
//
//    PAGE LOAD
//
/////////////////////////////////////////////////////////////////////////////////////////


// add the branch commands to the description
var submitter      = $('.timeline-comment-header-text .author').first().text()
  , branch         = $('.gh-header-meta .css-truncate-target').last().text()
  , repo           = ($('meta[name="twitter:title"]').attr('content') || '').replace(/.*\//, '')
  , gitCommands    = 'git checkout -b ' + submitter + '-' + branch + ' master\n<br>git pull git@github.com:' + submitter + '/' + repo + ' ' + branch + '\n<br>'
  , commandButton  = '<div id="gitCommands" class="comment">' + gitCommands + '</div>'

$('.timeline-comment').first().after(commandButton);



/////////////////////////////////////////////////////////////////////////////////////////
//
//    LISTENERS
//
/////////////////////////////////////////////////////////////////////////////////////////

// if the post to ticket box is checket, post the PR
$('.pull-request-composer button').on('click', function (e) {
  var result = parseTitle($('#pull_request_title').val()) 
    , path   = window.location.pathname
    , fork   = path.replace(/\/compare.*/, '');

  getLatestPr(fork, function (latestPr) {
    var newPrNum = latestPr + 1;
    if ($('#post-ticket').is(':checked') && result.ticket) {
      postToTicket('PR submitted: https://github.com' + fork + '/pull/' + newPrNum, result.ticket);
    }
  });
})

/////////////////////////////////////////////////////////////////////////////////////////
//
//    POLLING FUNCTIONS
//
/////////////////////////////////////////////////////////////////////////////////////////


var poller = new Poller();

poller.addFunc(linkTicket);
poller.addFunc(formatLinks);
poller.addFunc(addCheckbox);

// start the poller
poller.start();


//
// turn the ticket number into a link
//
function linkTicket () {
  // if it's already formatted, return
  if ($('.js-issue-title .bb_formatted').length) { return; }

  var prTitle    = $('.js-issue-title')
    , result     = parseTitle(prTitle.text())

  // Convert the ticket number to a link 
  if (result.ticket) {
    var href = 'https://brander.atlassian.net/browse/' + result.ticket
      , link = '<a href="' + href + '" class="bb_formatted">' + result.ticket + '</a>';

    prTitle.empty();
    prTitle.append(link);
    prTitle.append(result.trailing)
  }
}

//
// make all localhost links clickable and only show the path
//
function formatLinks () {
  $('.comment-body').each(function (index, element) {
    // get the comment text and any localhost links
    var comment = $(element)
      , text    = comment.html()
      , hrefs   = text.match(/(http:\/\/localhost:.*)\s/g);

    // if we already formattted the links in this comment, or there aren't any links to format, return
    if (!(!comment.find('a.bb_formatted').length && hrefs && hrefs.length)) { return; }

    // replace the links in the text string with link elements
    _.each(hrefs, function (href) {
      //make sure to preserve trailing elements, like <br> and <p>
      var match    = href.match(/(http:\/\/localhost:\d+)(\/\S*)(<?.*)/) || []
        , host     = match[1]
        , path     = match[2]
        , trailing = match[3]
        , link     = '<a href="' + host + path + '" class="bb_formatted">' + path + '</a>' + trailing;

      text = text.replace(href, link);
    });
    
    // set the text in the comment
    comment.empty();
    comment.append(text);
  })
}

//
// if its a PR, add the checkbox
//
function addCheckbox () {
  if($('#post-ticket').length) { return; } 

  var checkbox = '<div class="post-ticket">' +
                    '<input type="checkbox" name="post-ticket" value="post-ticket" id="post-ticket" checked>' +
                    '<label for="post-ticket">Post to ticket<label>' +
                  '</div>';

  $('.pull-request-composer .composer-meta .composer-submit').before(checkbox);
}


/////////////////////////////////////////////////////////////////////////////////////////
//
//    HELPERS
//
/////////////////////////////////////////////////////////////////////////////////////////


function parseTitle (text) {
  var match = text.match(/(^[A-Z]+-[0-9]+)(\s.*)/) || [];

  return {
    ticket   : match[1],
    trailing : match[2]
  }
}

function postToTicket (comment, ticket) {
  $.ajax({
    headers : { 
      'Accept'       : 'application/json',
      'Content-Type' : 'application/json' 
    },
    url      : 'https://brander.atlassian.net/rest/api/2/issue/' + ticket + '/comment',
    data     : JSON.stringify({ body : comment }),
    dataType : 'json',
    method   : 'POST'
  });
}

function getLatestPr(fork, callback) {

  // get open PR's
  function openPrs () {
    return $.ajax({ url: 'https://github.com' + fork + '/pulls?direction=desc&page=1&sort=created&state=open' });
  }

  // get closed PR's
  function closedPrs () {
    return $.ajax({ url: 'https://github.com' + fork + '/pulls?direction=desc&page=1&sort=created&state=closed' });
  }

  // take the highest number pr
  $.when(openPrs(), closedPrs()).done(function (open, closed) {
    var latestPr = 0;
    if (open.length) {
      $(open[0]).find('.list-group-item-number').each(function (index, element) {
        var prNum = parseInt($(element).text().replace('#', ''));
        if (prNum > latestPr) { latestPr = prNum; }
      });
    }

    if (closed.length) {
      $(closed[0]).find('.list-group-item-number').each(function (index, element) {
        var prNum = parseInt($(element).text().replace('#', ''));
        if (prNum > latestPr) { latestPr = prNum; }
      });
    }


    return callback(latestPr);
  });
}