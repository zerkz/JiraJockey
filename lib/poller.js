
// POLLER
//
// loops for the duration of the page, reformatting it when necessary
//
//   the loop executes for the duration of the timeout. then only 
//   restarts if an onclick event occurs
//

function Poller (functionSet) {
  this.frequency    = ONESEC = 1000; // when active poll every 100 miliseconds
  this.timeout      = ONEMIN = 60000;  // after this timeout, cease polling until an event is detected
  this.timer        = 0;        // timer to track the time passed in this polling iteration
  this.intervalId   = null;     // interval id is used to both terminate the poller and keep state
  this.functionSet  = functionSet && functionSet.length ? functionSet : [];       // at each iteration, execute this function set

  // start/reset the poller on mouseover
  var self = this;
  $(document).mouseover(function (e) { 
    self.start(); 
  });
}

// add a function to ececute on each interval
Poller.prototype.addFunc = function (func) {
  this.functionSet.push(func);
};
 
// start/restart the poller
Poller.prototype.start = function () {
  if (!this.intervalId) {

    this.timer  = 0;

    var self = this;
    this.intervalId = window.setInterval (function () {
      self.execSet();
    }, this.frequency);
  }
};
 
// execute the set of functions, if there was a time out, terminate the poller
Poller.prototype.execSet = function () {
  if (this.timer < this.timeout) {

    // execute the function list
    for (index in this.functionSet) {
      this.functionSet[index]();
    }

    // increment the timer
    this.timer = this.timer + this.frequency;
    
  // if the poller timed out, stop execution
  } else {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
};