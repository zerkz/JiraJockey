
var assignee = 'assignee=john.hofrichter'
  , filter = '(status="in progress"'
               +' OR status="open"'
               +' OR status="in code review")';

var query = {
      jql: assignee + ' AND ' + filter 
    }

$.get('https://brander.atlassian.net/rest/api/2/search', query).done(function (response) {
 console.log(response);

$('body').empty();
$('body').append(response)
});