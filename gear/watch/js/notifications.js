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
                    $scope.main = message.data;
                    $scope.main.type = message.type;
                    $scope.main.time = message.data.time;

                    break;
                case 'event':
                    $scope.activeNotifications.push({
                        type: 'event',
                        title: message.data.name,
                        time: message.data.date + " " + message.data.time,
                        extra: message.data
                    });
                    $scope.main = message.data;
                    $scope.main.title = message.data.name;
                    $scope.main.type = message.type;
                    $scope.main.time = message.data.date + " " + message.data.startTime;

                    break;
                case 'comms':
                    $scope.activeNotifications.push({
                        type: 'comms',
                        title: 'Comms updated',
                        time: message.data.date + " " + message.data.time
                    });
                    $scope.main = message.data;
                    $scope.main.title = 'Comms updated';
                    $scope.main.type = message.type;
                    $scope.main.time = message.data.time;
                    break;
            }

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

        $scope.onBgClick = function (scope, e) {
            console.error("BG CLCK");
            if ($scope.main) {
                $scope.dismiss_();
            }
            //e.stopPropagation();
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
            tau.changePage('hsectionchangerPage');

            switch ($scope.main.type) {
                case 'alert':
                    AppState.alert = $scope.main;
                    AppState.currentScreen = 'alert-details';
                    tau.changePage('alert-details');
                    break;
                case 'event':
                    AppState.event = $scope.main;
                    AppState.currentScreen = 'event-details';
                    tau.changePage('event-details');
                    break;
                case 'comms:':
                    var sectionChanger = document.getElementById("sectionchanger");
                    sectionChanger.setActiveSection(3);
                    break
            }

            $scope.dismiss_($event);
        };

        $scope.moreClick = function ($event) {
            $scope.dismiss_($event);

            tau.changePage('hsectionchangerPage');
            var sectionChanger = document.getElementById("sectionchanger");
            sectionChanger.setActiveSection(3);
        };

        $scope.dismiss_ = function () {
            $scope.main = null;
            $scope.activeNotifications.splice(0, $scope.activeNotifications.length);
            //$event.stopPropagation();
            if (navigator.vibrate) {
                navigator.vibrate(0);
            }
            if ($scope.vibrateInterval) {
                clearInterval($scope.vibrateInterval);
                $scope.vibrateInterval = null;
            }
        };
    });