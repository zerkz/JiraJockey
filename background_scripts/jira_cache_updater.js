//
// validate the age and content of the cache every 15 minutes. This will hten be used if jira is down
//
cacheUpdater();
setInterval(cacheUpdater, FIFTEEN_MIN);

function cacheUpdater () {
  getUserCache(function (results) {
    if (results.expired) {
      updateUserCache();
    }
  });

  getAgileCache(function (results) {
    if (results.expired) {
      updateAgileCache();
    }
  });
}