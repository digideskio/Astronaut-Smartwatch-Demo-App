angular.module('Watch')
    .constant('timerConfig', {
        circleMax: 3600, // 1 hour
        tick: 1,
        timeLeftOrange: 300, // 5 minutes
        timeLeftYellow: 900, // 15 minutes
        timeLeftGreen: 1800 // 30 minutes
    })
    .run(function ($rootScope, $interval) {
        $interval(function () {
            $rootScope.$emit("timerTick");
        }, 1000);
        return {};
    })
    .factory("TimerCommon", function (AppState, timerConfig) {
        return {
            isTimerPassHour: function (index) {
                if (AppState.getTimer(index)) {
                    var timer = AppState.getTimer(index);
                    if (timer.countdown) {
                        return timer.total - timer.elapsed >= timerConfig.circleMax;
                    } else {
                        return timer.elapsed >= timerConfig.circleMax;
                    }
                }
            },

            getTimerColor: function (index) {
                if (AppState.getTimer(index)) {
                    var timer = AppState.getTimer(index);
                    if (!timer.countdown) {
                        return "#fff";
                    }
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
            },
            timeLeft: function (ind) {
                var timer = AppState.getTimer(ind);
                var format = timer.countdown ? "-HH:mm:ss" : "HH:mm:ss";
                return moment.duration(timer.current, 'seconds').format(format, {trim: false});
            }
        }
    })
    .controller('TimersCtrl', function ($scope, $rootScope, AppState, timerConfig, TimerCommon) {
        $scope.selectedTimerIndex = 0;

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
            //TODO:
            //AppState.activeTimer = index;
            //AppState.currentScreen = 'timer-details';
            //tau.changePage('timer-details');
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
            return TimerCommon.isTimerPassHour(index);
        };

        $scope.getTimerColor = function (index) {
            return TimerCommon.getTimerColor(index);
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

            AppState.setTimer(index, timer);
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

            AppState.setTimer(index, timer);
        };

        $scope.activeTimerName = function () {
            if (AppState.getTimer($scope.selectedTimerIndex)) {
                var index = $scope.selectedTimerIndex + 1;
                return "0" + index;
            } else {
                return "";
            }
        };

        $scope.activeTimerValue = function () {
            if (AppState.getTimer($scope.selectedTimerIndex)) {
                var format = AppState.getTimer($scope.selectedTimerIndex).countdown ? "-HH:mm:ss" : "HH:mm:ss";
                return moment.duration(AppState.getTimer($scope.selectedTimerIndex).current, 'seconds').format(format, {trim: false});
            } else {
                return "";
            }
        };

        $scope.cycle = function () {
            if ($scope.selectedTimerIndex + 1 >= AppState.totalTimers()) {
                $scope.selectedTimerIndex = 0;
            } else {
                $scope.selectedTimerIndex++;
            }
        };

        $scope.timeLeft = function (index) {
            return TimerCommon.timeLeft(index);
        };

        $scope.removeTimer = function (index) {
            AppState.setActive(index, false);
            AppState.removeTimer(index);

            if (AppState.totalTimers() == 0) {
                $scope.selectedTimer = null;
            } else {
                $scope.selectedTimerIndex = 0;
            }
        };

        $scope.isActive = function(index) {
            return AppState.isActive(index);
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
                $scope.selectedTimerIndex = AppState.totalTimers() - 1;
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
                    pos: AppState.totalTimers() + 1,
                    name: "Custom Timer",
                    elapsed: elapsed,
                    total: totalTime,
                    countdown: AppState.isNewCountdown(),
                    active: true,
                    current: elapsed,
                    type: 'custom'
                };
                AppState.setTimer(AppState.totalTimers(), newTimer);
                $scope.timer = new Date("1/1/16 0:00");
            }
        });
    })
    .controller('TimerDetailsCtrl', function ($scope, $rootScope, AppState, timerConfig, TimerCommon) {
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
            return TimerCommon.getTimerColor($scope.timerIndex);
        };

        $scope.isTimerPassHour = function () {
            return TimerCommon.isTimerPassHour($scope.timerIndex)
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
