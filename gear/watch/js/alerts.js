angular.module('Watch')
    .controller('AlertsCtrl', function ($scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = false;
        $scope.alerts = Api.events.query();

        $scope.showAlert = function (alert) {
            AppState.alert = alert;
            AppState.currentScreen = 'alert-details';
            tau.changePage('alert-details');
        };
    })
    .controller('AlertDetailCtrl', function ($scope, AppState) {
        $scope.currentData = AppState;
    });
