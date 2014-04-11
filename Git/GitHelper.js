

var prTitle    = $('.js-issue-title')
  , titleText  = prTitle.text()
  , match      = titleText.match(/(^[A-Z]+-[0-9]+)(\s.*)/) || []
  , jiraTicket = match[1]
  , trailing   = match[2]


// Convert the ticket number to a link 
if (jiraTicket) {
  var href = 'https://brander.atlassian.net/browse/' + jiraTicket
    , link = '<a href="' + href + '">' + jiraTicket + '</a>';

  prTitle.empty()
  prTitle.append(link);
  prTitle.append(trailing)
}

// add the branch commands to the description
var submitter      = $('.timeline-comment-header-text .author').first().text()
  , branch         = $('.gh-header-meta .css-truncate-target').last().text()
  , repo           = ($('meta[name="twitter:title"]').attr('content') || '').replace(/.*\//, '')
  , gitCommands    = 'git checkout -b ' + submitter + '-' + branch + ' master\n<br>git pull git@github.com:' + submitter + '/' + repo + ' ' + branch + '\n<br>'
  , commandButton  = '<div id="gitCommands" class="comment">' + gitCommands + '</div>'


$('.timeline-comment').first().after(commandButton);
$('#gitCommands').on('click', function (e) {
  console.log($(e.target).text())
  copyToClipboard($(e.target).text());
})
