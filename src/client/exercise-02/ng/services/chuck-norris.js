
const URL = 'http://api.icndb.com/jokes/random/3?exclude=[nerdy,explicit]';

window._app.global_ng_module
.service('chuckNorris', ['$http', function($http) {

  this.fetch3Random = function() {
    return $http.get(URL);
  };

}]);