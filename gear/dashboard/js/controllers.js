angular.module("Dashboard", ['ngRoute', 'ngResource', 'angular.filter'])
    .controller("MainCtrl", function ($scope, $interval) {
        $scope.time = new Date();
        $interval(function () {
            $scope.time = new Date();
        }, 1000);
    });