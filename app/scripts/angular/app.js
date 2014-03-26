'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: '/views/tpl/welcome.html',
            controller: 'WelcomeCtrl'
        })
        .when('/post',
        {
            templateUrl: '/views/tpl/articles.html',
            controller: 'TagsCtrl'
        })
        .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
}]);