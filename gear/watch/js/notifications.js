angular.module("Watch")
    .controller("NotificationsCtrl", function ($rootScope, $scope, AppState) {
        $scope.vibrationPattern = {
            'event': [600],
            'aos': [150, 50, 150, 50, 150],
            'Notice': [400, 200, 400],
            'Caution': [250, 200],
            'Critical': [200, 100]
        };

        $scope.activeNotifications = [];

        $rootScope.$on('push', function (event, message) {
            console.error("PROCESS NEW ALERT");
            switch (message.type) {
                case 'alert':
                    $scope.activeNotifications.push({
                        type: alert,
                        title: message.data.title,
                        time: message.data.time,
                        extra: message.data
                    });
                    break;
                case 'event':
                    $scope.activeNotifications.push({
                        type: 'event',
                        title: message.data.name,
                        time: message.data.date + " " + message.data.time,
                        extra: message.data
                    });
                    break;
            }

            $scope.main = message.data;
            $scope.main.type = message.type;

            if (message.type == 'alert' && message.data.status == 'Critical' || message.data.status == 'Caution') {
                $scope.repeatVibration(message.data.status);
            } else if (navigator.vibrate) {
                if (message.type == 'alert') {
                    navigator.vibrate($scope.vibrationPattern[message.data.status]);
                } else {
                    navigator.vibrate($scope.vibrationPattern[message.type]);
                }
            }
        });

        $scope.onBgClick = function ($event) {
            console.error("BG CLCK");
            if ($scope.activeNotifications && $scope.activeNotifications.length > 0) {
                $scope.dismiss_($event);
            }
        };

        $scope.repeatVibration = function (status) {
            var delay = $scope.vibrationPattern[status][0] + $scope.vibrationPattern[status][1];

            if (navigator.vibrate) {
                $scope.vibrateInterval = setInterval(function () {
                    navigator.vibrate($scope.vibrationPattern[status]);
                }, delay);
            }

        };

        $scope.mainClick = function ($event) {

            $scope.dismiss_($event);
            tau.changePage('hsectionchangerPage');

            if ($scope.main.type == 'alert') {
                AppState.alert = $scope.main;
                AppState.currentScreen = 'alert-details';
                tau.changePage('alert-details');
            } else {
                AppState.event = $scope.main;
                AppState.currentScreen = 'event-details';
                tau.changePage('event-details');
            }
        };

        $scope.moreClick = function ($event) {
            $scope.dismiss_($event);

            tau.changePage('hsectionchangerPage');
            var sectionChanger = document.getElementById("sectionchanger");
            sectionChanger.setActiveSection(3);
        };

        $scope.dismiss_ = function ($event) {
            $scope.activeNotifications.splice(0, $scope.activeNotifications.length);
            $event.stopPropagation();
            if (navigator.vibrate) {
                navigator.vibrate(0);
            }
        }
    });