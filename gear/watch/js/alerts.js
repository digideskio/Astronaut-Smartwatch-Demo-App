angular.module('Watch')
    .controller('AlertsCtrl', function ($rootScope, $scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = true;
        Api.alerts.query(function(data) {
            $scope.busy = false;
            $scope.alerts = data;
        });

        $scope.showAlert = function (alert) {
            AppState.alert = alert;
            AppState.currentScreen = 'alert-details';
            tau.changePage('alert-details');
        };

        $rootScope.$on('push', function (event, message) {
            if (message.type == 'alert') {
                $scope.alerts = Api.events.query();
            }
        });
    })
    .controller('AlertDetailCtrl', function ($scope, AppState) {
        $scope.currentData = AppState;
    });
