angular.module('Watch')
    .constant('timerConfig', {
        circleMax: 3600, // 1 hour
        tick: 1,
        timeLeftOrange: 300, // 5 minutes
        timeLeftYellow: 900, // 15 minutes
        timeLeftGreen: 1800 // 30 minutes
    })
    .service('TimerTick', function ($rootScope, $interval) {
        $interval(function () {
            $rootScope.$emit("timerTick");
        }, 1000);
        return {};
    })
    .controller('TimersCtrl', function ($scope, $rootScope, AppState, timerConfig, TimerTick) {
        $scope.selectedTimer = AppState.getTimer(0);

        $scope.onInitMainSvg = function () {
            var mainSnap = Snap("#timers-main");
            $scope.selectedTimerName = mainSnap.select("#name-value");
            $scope.selectedTimerProgress = mainSnap.select("#current-value");
        };

        $scope.onInitButtonsSvg = function () {
            var buttonsSnap = Snap("#timer-buttons");
            buttonsSnap.select("#Chrono").click(function () {
                $scope.setTimer();
            });
            buttonsSnap.select("#Timer").click(function () {
                $scope.setCountDown();
            });
        };

        $scope.showTimerDetails = function (index) {
            AppState.activeTimer = index;
            AppState.currentScreen = 'timer-details';
            tau.changePage('timer-details');
        };

        $scope.getTimer = function (ind) {
            return AppState.getTimer(ind);
        };

        $scope.setTimer = function () {
            AppState.setNewCountdown(false);
            AppState.currentScreen = 'set-timer';
            tau.changePage('set-timer');
        };

        $scope.setCountDown = function () {
            AppState.setNewCountdown(true);
            AppState.currentScreen = 'set-timer';
            tau.changePage('set-timer');
        };

        $scope.isTimerPassHour = function (index) {
            if (AppState.getTimer(index)) {
                var timer = AppState.getTimer(index);
                if (timer.countdown) {
                    return timer.total - timer.elapsed >= timerConfig.circleMax;
                } else {
                    return timer.elapsed >= timerConfig.circleMax;
                }
            }
        };

        $scope.getTimerColor = function (index) {
            if (AppState.getTimer(index)) {
                var timer = AppState.getTimer(index);
                var timeLeft = 0;
                if (timer.countdown) {
                    timeLeft = timer.elapsed;
                } else {
                    timeLeft = timer.total - timer.elapsed;
                }

                if (timeLeft <= timerConfig.timeLeftOrange) {
                    return 'EE8421';
                } else if (timeLeft <= timerConfig.timeLeftYellow) {
                    return 'F7E53B';
                } else if (timeLeft <= timerConfig.timeLeftGreen) {
                    return '81D135';
                } else {
                    return '#FFF';
                }

            } else {
                return '#FFF';
            }
        };

        $rootScope.$on('timerTick', function (event, data) {
            for (var i = 0; i < AppState.totalTimers(); i++) {
                var timer = AppState.getTimer(i);
                if (!AppState.isActive(i)) {
                    continue;
                }
                if (timer.countdown) {
                    $scope.updateCountdown(i, timer);
                } else {
                    $scope.updateTimer(i, timer);
                }
            }
            $scope.updateMainDisplay();
        });

        $scope.updateTimer = function (index, timer) {
            if (timer.elapsed >= timer.total) {
                timer.elapsed = timer.total;
                AppState.setActive(index, false);
            } else {
                timer.elapsed += timerConfig.tick;
            }

            if (timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }
        };

        $scope.updateCountdown = function (index, timer) {
            if (timer.elapsed <= 0) {
                timer.elapsed = 0;
                AppState.setActive(index, false);
            } else {
                timer.elapsed -= timerConfig.tick;
            }

            if (timer.total - timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }
        };

        $scope.updateMainDisplay = function () {
            if ($scope.selectedTimer) {
                $scope.selectedTimerName.attr({text: "0" + $scope.selectedTimer.name});
                var format = $scope.selectedTimer.countdown ? "-HH:mm:ss" : "HH:mm:ss";
                var current = moment.duration($scope.selectedTimer.current, 'seconds').format(format, {trim: false});
                $scope.selectedTimerProgress.attr({text: current});
            } else if($scope.selectedTimerName) {
                $scope.selectedTimerName.attr({text: ""});
                $scope.selectedTimerProgress.attr({text: ""});
            }
        };

        $scope.timeLeft = function (index) {
            var timer = AppState.getTimer(index);
            var format = timer.countdown ? "-HH:mm:ss" : "HH:mm:ss";
            return moment.duration($scope.selectedTimer.current, 'seconds').format(format, {trim: false});
        };

        $scope.removeTimer = function (index) {
            AppState.setActive(index, false);
            AppState.removeTimer(index);

            if (AppState.totalTimers() == 0) {
                $scope.selectedTimer = null;
            } else {
                $scope.selectedTimer = AppState.getTimer(0);
            }
        };

        $scope.playPause = function (index) {
            AppState.setActive(index, !AppState.isActive(index));
        };

        $scope.$watch(
            function () {
                return AppState.totalTimers();
            },
            function (newVal) {
                $scope.timerz = AppState.timersInfo;
                $scope.selectedTimer = AppState.getTimer(AppState.totalTimers() - 1);
            },
            true);

    })
    .controller('SetTimerCtrl', function ($scope, $rootScope, AppState) {
        $scope.timer = new Date("1/1/16 0:00");

        $rootScope.$on('close', function (event, data) {
            if (data == 'set-timer') {
                var totalTime = $scope.timer.getSeconds() + $scope.timer.getMinutes() * 60 + $scope.timer.getHours() * 3600;
                if (totalTime == 0) {
                    return;
                }

                var elapsed = AppState.isNewTimerCountdown ? totalTime : 0;
                var newTimer = {
                    name: AppState.totalTimers() + 1,
                    elapsed: elapsed,
                    total: totalTime,
                    countdown: AppState.isNewCountdown(),
                    active: true,
                    current: elapsed
                };
                AppState.setTimer(AppState.totalTimers(), newTimer);
                $scope.timer = new Date("1/1/16 0:00");
            }
        });
    })
    .controller('TimerDetailsCtrl', function ($scope, $rootScope, AppState, timerConfig, TimerTick) {
        $scope.timerIndex = AppState.activeTimer;
        $scope.timer = AppState.getTimer(AppState.activeTimer);

        $scope.onTimerDetailSvgReady = function () {
            var mainSnap = Snap("#timer-details-svg");
            $scope.timerName = mainSnap.select("#name-value");
            $scope.timerProgress = mainSnap.select("#current-value");
        };

        $scope.removeTimer = function () {
            AppState.removeTimer($scope.timerIndex);
        };

        $scope.playPause = function () {
            AppState.setActive($scope.timerIndex, !AppState.isActive($scope.timerIndex));
        };

        $scope.updateTimer = function () {
            var timer = AppState.getTimer($scope.timerIndex);

            if (timer.elapsed >= timer.total) {
                timer.elapsed = timer.total;
                AppState.setActive(index, false);
            } else {
                timer.elapsed += timerConfig.tick;
            }

            if (timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }
        };

        $scope.updateCountdown = function () {
            var timer = AppState.getTimer($scope.timerIndex);
            if (timer.elapsed <= 0) {
                timer.elapsed = 0;
                AppState.setActive(index, false);
            } else {
                timer.elapsed -= timerConfig.tick;
            }

            if (timer.total - timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }

        };

        $scope.updateMainDisplay = function () {
            if (!$scope.timerName) {
                return;
            }

            var timer = AppState.getTimer($scope.timerIndex);
            if (timer) {
                $scope.timerName.attr({text: "0" + timer.name});
                var format = timer.countdown ? "-HH:mm:ss" : "HH:mm:ss";
                var current = moment.duration(timer.current, 'seconds').format(format, {trim: false});
                $scope.timerProgress.attr({text: current});
            } else {
                $scope.timerName.attr({text: ""});
                $scope.timerProgress.attr({text: ""});
            }
        };

        $scope.getTimerColor = function () {
            if (!AppState.getTimer($scope.timerIndex)) {
                return;
            }

            var timer = AppState.getTimer($scope.timerIndex);
            var timeLeft = 0;
            if (timer.countdown) {
                timeLeft = timer.elapsed;
            } else {
                timeLeft = timer.total - timer.elapsed;
            }

            if (timeLeft <= timerConfig.timeLeftOrange) {
                return 'EE8421';
            } else if (timeLeft <= timerConfig.timeLeftYellow) {
                return 'F7E53B';
            } else if (timeLeft <= timerConfig.timeLeftGreen) {
                return '81D135';
            } else {
                return '#FFF';
            }
        };

        $scope.isTimerPassHour = function () {
            if (!AppState.getTimer($scope.timerIndex)) {
                return;
            }

            var timer = AppState.getTimer($scope.timerIndex);
            if (timer.countdown) {
                return timer.total - timer.elapsed >= timerConfig.circleMax;
            } else {
                return timer.elapsed >= timerConfig.circleMax;
            }
        };

        $rootScope.$on('timerTick', function (event, data) {
            //if (AppState.isActive($scope.timerIndex)) {
            //    var timer = AppState.getTimer($scope.timerIndex);
            //    if (timer.countdown) {
            //        $scope.updateCountdown();
            //    } else {
            //        $scope.updateTimer();
            //    }
            //}
            $scope.updateMainDisplay();
        });

        $scope.getTimerCurrent = function () {
            var timer = AppState.getTimer($scope.timerIndex);
            if (timer) return timer.current;
            else return 0;
        }
    });