//constants
var _defaultExp = HALF_HOUR = 1800000;

var cache = {
  get : function (cacheName, callback) {  
      STORE.get(cacheName, function (cacheData) {

      // var cacheExpired = new Date().getTime() > cacheData.expireTime;
      // if (!cacheData.value || cacheExpired) {
      //   cacheData.value = { expired : true };
      // }

      return callback(cacheData.value);
    });
  },

  set : function (cacheName, value, cacheLength) {
    var currentTime = new Date().getTime()
      , cacheData   = {
          timeSet    : currentTime,
          expireTime : cacheLength ? currentTime + cacheLength : currentTime + _defaultExp,
          value      : value || {}
        };

    return STORE.set(cacheName, cacheData);
  }
}