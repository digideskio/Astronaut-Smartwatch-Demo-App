angular.module("Watch", ['ngRoute', 'ngResource', 'angular.filter', 'infinite-scroll',
    'angular-svg-round-progress', 'ui.bootstrap', 'ngWebsocket'])
    .config(function ($locationProvider) {
        return $locationProvider.html5Mode(false).hashPrefix("!");
    })
    .controller('HeaderCtrl', function ($scope, $interval, $rootScope, AppState) {
        $scope.time = new Date();

        $rootScope.$on('timerTick', function () {
            $scope.time = new Date();
        });

        $scope.goBack = function () {
            $rootScope.$emit("close", AppState.currentScreen);
            tau.back();
        };
    });


