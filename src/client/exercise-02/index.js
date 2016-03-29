//console.log('loading landing app main js...');

import 'angular';
import 'angular-ui-router';
import 'angular-aria';
import 'angular-animate';
import 'angular-messages';
import 'angular-material';
import 'angular-material/angular-material.css!';
import 'angular-material/angular-material.layouts.css!';

import app from 'client/common/incubator/ng-app-bootstrap';

app.global_ng_module_dependencies = ['ui.router', 'ngAria', 'ngAnimate', 'ngMessages', 'ngMaterial'];

window._app.global_ng_module
.controller('AppController', [function () {
  this.title = 'Exercise 02';
}]);

// use more convenient AMD syntax
require([
    'client/exercise-02/ng/components/fact',
    'client/exercise-02/ng/components/layout',
    'client/exercise-02/index.css!'
], app.bootstrap);
