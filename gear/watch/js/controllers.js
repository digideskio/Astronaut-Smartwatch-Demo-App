angular.module("Watch", ['ngRoute', 'ngResource', 'angular.filter', 'infinite-scroll',
    'angular-svg-round-progress', 'ui.bootstrap', 'ngWebsocket'])
    .config(function ($locationProvider) {
        return $locationProvider.html5Mode(false).hashPrefix("!");
    })
    .controller('HeaderCtrl', function ($scope, $interval, $rootScope, AppState) {
        $scope.state = AppState;

        $scope.goBack = function () {
            $rootScope.$emit("close", AppState.currentScreen);
            tau.back();
        };
    });


