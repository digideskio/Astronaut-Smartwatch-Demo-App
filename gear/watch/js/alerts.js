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

        Api.alerts().query(function (data) {
            $scope.busy = false;
            $scope.alerts = data;
        }, function (err) {
            $scope.busy = false;
        });

        $scope.showAlert = function (alert) {
            AppState.alert = alert;
            if (!alert.ack) {
                alert.ack = [];
            }
            if (alert.ack.indexOf(AppState.activeRole) == -1) {
                alert.ack.push(AppState.activeRole);
                Api.alertAck().update({alertId: AppState.alert.id, roleId: AppState.activeRole}, {}, function (result) {
                    $scope.alerts = result;
                    console.error("ACK OK");
                }, function (err) {
                    console.error("ACK FAIL");
                });
            }
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
                $scope.alerts = orderBy($scope.alerts, function (alert) {
                    return sortPriority[alert.status];
                });
            }
        };

        $rootScope.$on('push', function (event, message) {
            $scope.alerts = Api.alerts().query();
        });

        $rootScope.$on('refresh', function () {
            $scope.alerts = Api.alerts().query();
        });

        $scope.getAlertColorClass = function (alert) {
            if (alert.status == 'Advisory') {
                return 'alert-advisory';
            } else if (alert.status == 'Warning') {
                return 'alert-warning';
            } else if (alert.status == 'Caution') {
                return 'alert-caution';
            } else if (alert.status == 'Emergency') {
                return 'alert-emergency';
            }
        };

        $scope.getAlertCount = function (alertStatus) {
            if ($scope.alerts) {
                var total = 0;
                for (var i = 0; i < $scope.alerts.length; i++) {
                    var alert = $scope.alerts[i];
                    if (alertStatus) {
                        if (alert.status === alertStatus) {
                            total++;
                        }
                    } else {
                        if (!_.contains(alert.ack, AppState.activeRole)) {
                            total++;
                        }
                    }
                }
                return total;
            }
            else {
                return 0;
            }
        };
    })
    .controller('AlertDetailCtrl', function ($scope, AppState, Api) {
        $scope.currentData = AppState;

        $scope.getAlertColorClass = function () {
            var alert = AppState.alert;
            if (alert.status === 'Advisory') {
                return 'alert-advisory';
            } else if (alert.status === 'Warning') {
                return 'alert-warning';
            } else if (alert.status === 'Caution') {
                return 'alert-caution';
            } else if (alert.status === 'Emergency') {
                return 'alert-emergency';
            }
        };
    });
