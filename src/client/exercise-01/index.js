
import 'angular';
import 'angular-ui-router';

const appModule = angular.module('app_module', []);


appModule.controller('AppController', ['$scope', function ($scope) {
  this.title = 'Exercise 01';

  $scope.$watch(() => console.count('$digest'));
}]);


appModule.component('layout', {
  templateUrl: 'client/exercise-01/layout.html'
});

appModule.controller('HelloController',
  ['$scope', function ($scope) {
    this.names = [];

    this.addName = function () {
      this.names.push(this.name);
      this.name = '';
      console.log('added a name:', this);

      // remove it after one second
      ////////////////////////////////////////
      // XXXX BAAAD NOT ANGULAR !!!!
      // DON'T WORK !
      // FIX ME !
        // setTimeout est une primitive JavaScript. Donc les MAJ ne sont pas prisent en compte par
      setTimeout(() => {
          this.names.shift();
          $scope.$digest();
      }, 1000);
      ////////////////////////////////////////
    };
  }]
);

// angular manual initialisation since we use a script loader
console.log('* Bootstrapping angular...');
angular.element(document).ready(function() {
  angular.bootstrap(document, ['app_module'], {strictDi: true});
});
