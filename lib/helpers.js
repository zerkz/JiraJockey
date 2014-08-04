
//
// general utilities
//

function currentTime () {
 return new Date().getTime() / 100000;
}

var queryParams = queryParams();
function queryParams() {
  var params     = {}
    , paramPairs = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

  for(var i = 0; i < paramPairs.length; i++) {
    var keyValue = paramPairs[i].split('=');
    params[keyValue[0]] = keyValue[1];
  }
  return params;
}

function Ticket (data) {
  var skeleton = {
        id       : null,
        type     : null,
        subtasks : [],
        status   : {
          name  : null,
          color : null
        },
        assignee : {
          name  : 'unassigned',
          image : 'https://brander.atlassian.net/secure/useravatar?size=medium&avatarId=10102'
        }
      }

  $.extend(true, this, skeleton, data);
}

function findValue (obj, namespace, defaultValue) {
  if (!obj) { return defaultValue; }

  var keys = namespace.split('.').reverse();
  while (keys.length && (obj = obj[keys.pop()]) != undefined);

  return (obj || defaultValue);
}


//
// cookie utilities
//


function getCookie (cname) {
  var name    = cname + "="
    , cookies = document.cookie.split(';');

  for (var i=0; i < cookies.length; i++) {
      var cookie = cookies[i];
      while (cookie.charAt(0)==' ') cookie = cookie.substring(1);
      if (cookie.indexOf(name) != -1) return cookie.substring(name.length, cookie.length);
  }
  return "";
}