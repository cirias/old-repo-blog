'use strict';

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: '/views/tpl/welcome.html',
            controller: 'WelcomeCtrl'
        });
    $routeProvider
        .when('/post',
        {
            templateUrl: '/views/tpl/postArticle.html',
            controller: 'TagsCtrl'
        })
        .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
}]);