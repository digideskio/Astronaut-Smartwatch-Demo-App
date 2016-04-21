angular.module('Watch')
    .controller('AlertsCtrl', function ($rootScope, $scope, Api, AppState, $filter) {

        $scope.busy = true;
        var orderBy = $filter('orderBy');
        moment.locale('en-gb');

        var sortPriority = {
            'Emergency': 0,
            'Warning': 1,
            'Caution': 2,
            'Advisory': 3
        };

        Api.alerts.query(function (data) {
            $scope.busy = false;
            $scope.alerts = data;
        });

        $scope.showAlert = function (alert) {
            AppState.alert = alert;
            AppState.currentScreen = 'alert-details';
            tau.changePage('alert-details');
        };

        $scope.sort = function (predicate) {
            if (predicate == 'time') {
                $scope.sortDate = true;
                $scope.sortType = false;
                $scope.alerts = orderBy($scope.alerts, function (alert) {
                    var date = new Date(alert.date + " " + alert.time);
                    return date;
                }, true);
            } else {
                $scope.sortType = true;
                $scope.sortDate = false;
                $scope.alerts.sort(function (l, r) {
                    return sortPriority[l.status] > sortPriority[r.status];
                });
            }
        };

        $rootScope.$on('push', function (event, message) {
            $scope.alerts = Api.alerts.query();
        });

        $rootScope.$on('refresh', function () {
            $scope.alerts = Api.alerts.query();
        });
    })
    .controller('AlertDetailCtrl', function ($scope, AppState) {
        $scope.currentData = AppState;
    });
