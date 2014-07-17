
// WARNING: this function is not effective with jira. due to the number of axaj requests and js functions used, polling is hte best method

//
// poll using the test function and execute the callback if the test is positive
//
function onTestComplete (executeTest, callback) {
  window.addEventListener ("load", poll, false);

  function poll () {
  	var timer    = 0
      , interval = window.setInterval (function () {

      	  // check for a succesfull test execution
          if(executeTest()) {
            clearInterval(interval);
            return callback();

          // timeout after five seconds  
          } else if (timer >= 25) {
            clearInterval(interval);
          } else {
            timer++;
          }
        }, 50);
  }
}

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


//
//  local storage utilities
//


var store   = chrome.storage.local
  , FIVEMIN = 300000; // five minutes


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