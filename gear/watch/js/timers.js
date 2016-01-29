angular.module('Watch')
    .controller('TimersCtrl', function ($scope, $interval, AppState) {
        $scope.getTimer = function (ind) {
            return AppState.getTimer(ind);
        };

        $scope.setTimer = function () {
            AppState.isNewTimerCountdown = false;
            AppState.currentScreen = 'set-timer';
            tau.changePage('set-timer');
        };

        $scope.setCountDown = function () {
            AppState.isNewTimerCountdown = true;
            AppState.currentScreen = 'set-timer';
            tau.changePage('set-timer');
        };

        $scope.isTimerPassHour = function (index) {
            if (AppState.getTimer(index)) {
                var timer = AppState.getTimer(index);
                return moment.range(timer.start, moment()).diff('hours') >= 1;
            }
        };

        $interval(function () {
            for (var i = 0; i < AppState.totalTimers(); i++) {
                $scope.updateTimer(AppState.getTimer(i));
            }
        }, 1000);

        $scope.updateTimer = function (timer) {
            if (!timer.active) {
                return;
            }

            var now = moment();
            var secondsPassed = moment.range(timer.start, now).diff('seconds');
            if (secondsPassed >= timer.total) {
                timer.active = false;
            } else {
                timer.current += 1;
                if (timer.current > 3600) {
                    timer.current = timer.current - 3600 * (timer.current / 3600);
                } else {
                }
            }
        };

        $scope.$watch(
            function () {
                return AppState.totalTimers();
            },
            function (newVal) {
                $scope.timerz = AppState.timersInfo;
            },
            true);

    })
    .controller('SetTimerCtrl', function ($scope, $rootScope, AppState) {
        $scope.timer = new Date("1/1/16 0:00");

        $rootScope.$on('close', function (event, data) {
            if (data == 'set-timer') {
                var totalTime = $scope.timer.getSeconds() + $scope.timer.getMinutes() * 60 + $scope.timer.getHours() * 3600;
                console.error("TOTAL = " + totalTime);
                if(totalTime == 0) {
                    return;
                }

                var newTimer = {
                    start: moment(),
                    total: totalTime,
                    countdown: AppState.isNewTimerCountdown,
                    active: true,
                    current: 0
                };
                AppState.setTimer(AppState.totalTimers(), newTimer);
                $scope.timer = new Date("1/1/16 0:00");
            }
        });
    });