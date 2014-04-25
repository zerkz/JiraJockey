
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
          console.log(timer)
        }, 50);
  }
}
