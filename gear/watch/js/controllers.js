angular.module("Watch", ['ngRoute', 'ngResource', 'angular.filter', 'infinite-scroll', 'angular-svg-round-progress', 'ui.bootstrap'])
    .config(function ($locationProvider) {
        return $locationProvider.html5Mode(true).hashPrefix("!");
    })
    .controller('HeaderCtrl', function ($scope, $interval, $rootScope, AppState, TimerTick) {
        $scope.time = new Date();

        $rootScope.$on('timerTick', function () {
            $scope.time = new Date();
        });

        $scope.goBack = function () {
            $rootScope.$emit("close", AppState.currentScreen);
            tau.back();
        };
    });


