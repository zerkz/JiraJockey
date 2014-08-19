
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

function findValue (obj, namespace, defaultValue) {
  if (!obj) { return defaultValue; }

  var keys = namespace.split('.').reverse();
  while (keys.length && (obj = obj[keys.pop()]) != undefined);

  return (obj || defaultValue);
}

function msToTimeObj (timeMs) {
  timeMs = timeMs || 0;
  var time = {};

  time.seconds = timeMs % 60;
  time.minutes = (timeMs / 60) % 60;
  time.hours   = (timeMs / ( 60 * 60 )) % 24;

  time.minString = function () {
    var str = '';
    str += time.hours ? time.hours + 'h ' : '';
    str += time.minutes ? time.minutes + 'm ' : '';
    str += time.seconds ? time.seconds + 's ' : '';
    return str || '0';
  }

  return time;
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