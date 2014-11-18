var poller = new Poller();

poller.addFunc(linkTicket);
poller.addFunc(formatLinks);
poller.addFunc(seedPr);

// start the poller
poller.start();


//
// turn the ticket number into a link
//
function linkTicket () {
  // if it's already formatted, return
  if ($('.js-issue-title .jj_formatted').length) { return; }

  var prTitle    = $('.js-issue-title')
    , titleText  = prTitle.text()
    , match      = titleText.match(/(^[A-Z]+-[0-9]+)(\s*.*)/) || []
    , jiraTicket = match[1]
    , trailing   = match[2]

  // Convert the ticket number to a link 
  if (jiraTicket) {
    var href = 'https://jira.brandingbrand.com/browse/' + jiraTicket
      , link = '<a href="' + href + '" class="jj_formatted">' + jiraTicket + '</a>';

    prTitle.empty();
    prTitle.append(link);
    prTitle.append(trailing)
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
    if (!(!comment.find('a.jj_formatted').length && hrefs && hrefs.length)) { return; }

    // replace the links in the text string with link elements
    _.each(hrefs, function (href) {
      //make sure to preserve trailing elements, like <br> and <p>
      var match    = href.match(/(http:\/\/localhost:\d+)(\/\S*)(<?.*)/) || []
        , host     = match[1]
        , path     = match[2]
        , trailing = match[3]
        , link     = '<a href="' + host + path.replace(/<.*>/, '') + '" class="jj_formatted">' + path + '</a>' + trailing;

      text = text.replace(href, link);
    });
    
    // set the text in the comment
    comment.empty();
    comment.append(text);
  })
}

function seedPr () {
  var $field = $('#new_pull_request [name="pull_request[body]"]:not(.jj_formatted)');

  if (!($field.length && !$field.val())) { return; }


  var lastTicket = '';
  $('.commits-listing .commit-message').each(function () {
    var commit = $(this).text().trim()
      , match  = commit.match(/(^[A-Z]+-[0-9]+)/) || []
      , ticket = match[1];

    if (ticket) {
      lastTicket = ticket;
    }
  });

  var seed = '**Ticket:** https://jira.brandingbrand.com/browse/' + lastTicket + '\n\n' +
              '**Reviewers:** \n\n' +
              '##Description\n\n\n\n' +
              '##Test\n\n\n';
  $field.val(seed);
  $field.addClass('jj_formatted');

}


// add the branch commands to the description
var submitter      = $('.timeline-comment-header-text .author').first().text()
  , newBranch      = $('.current-branch').last().find('.css-truncate-target').last().text()
  , sourceBranch   = $('.current-branch').first().find('.css-truncate-target').last().text()
  , repo           = ($('meta[name="twitter:title"]').attr('content') || '').replace(/.*\//, '')
  , gitCommands    = 'git checkout -b ' + submitter + '-' + newBranch + ' ' + sourceBranch + ' &&<br>git pull git@github.com:' + submitter + '/' + repo + ' ' + newBranch + '\n<br>'
  , commandButton  = '<div id="gitCommands" class="comment">' + gitCommands + '</div>'

$('.timeline-comment').first().after(commandButton);

// if this is a comparicon page
if (/\/compare\//.test(window.location)) {
  var prompt = '<div id="jira-prompt">' + 
                 '<input type="checkbox" id="transfer" value="code-review"> Transition ticket?<br>' +
                 '<input type="text" placeholder="Time spent">' +
                 '<input type="text" placeholder="Assign to">' +
                 '<input type="text" placeholder="Additional comments">' +
               '</div>'
  // $('.pull-request-composer .composer-meta').append(prompt);

}
