

var prTitle    = $('.js-issue-title')
  , titleText  = prTitle.text()
  , match      = titleText.match(/(^[A-Z]+-[0-9]+)(\s.*)/) || []
  , jiraTicket = match[1]
  , trailing   = match[2]

if (jiraTicket) {
  var href = 'https://brander.atlassian.net/browse/' + jiraTicket
    , link = '<a href="' + href + '">' + jiraTicket + '</a>';

  prTitle.empty()
  prTitle.append(link);
  prTitle.append(trailing)
}
