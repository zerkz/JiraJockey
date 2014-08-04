
//
// Times in milliseconds
//

var TENTH_SEC   = 100
  , ONE_SEC     = 1000
  , FIVE_SEC    = 5000
  , TEN_SEC     = 10000
  , HALF_MIN    = 30000
  , ONE_MIN     = 60000
  , TWO_MIN     = 120000
  , FIVE_MIN    = 300000
  , TEN_MIN     = 600000
  , FIFTEEN_MIN = 900000

//
// wrapper for chromes poorly thought out storage functionality
//

var STORE = {
      set : function (key, value, callback) {
        var obj = {};

        obj[key] = value;

        return chrome.storage.local.set(obj, callback);
      },
      get : function (key, callback) {
        // return the first value of the first key-value pair we find
        chrome.storage.local.get(key, function (result) {
          var keys     = Object.keys(result)
            , firstKey = keys.length && keys[0]
            , firstVal = result[firstKey];

          if (keys.length) { 
            return callback(firstVal); 
          }
        });
      }
    }