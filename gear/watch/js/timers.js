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
    .factory("Timers", function () {
        return {
            activeTimer: 0,
            timers: [],

            get: function (ind) {
                return this.timers[ind];
            },

            replace: function (timers) {
                this.timers = timers.slice();
            },

            set: function (index, timer) {
                this.timers[index] = timer;
            },

            add: function (timer) {
                this.timers.push(timer);
            },

            remove: function (index) {
                this.timers.splice(index, 1);
            },

            count: function () {
                return this.timers.length;
            },

            isActive: function (index) {
                if (this.timers.length == 0) {
                    return false;
                } else {
                    var timer = this.timers[index];
                    if (timer) {
                        return timer.isActive;
                    } else {
                        return false;
                    }
                }
            },

            setActive: function (index, isActive) {
                this.timers[index].isActive = isActive;
            }
        };
    })
    .factory("TimerCommon", function (Timers, timerConfig) {
        return {
            isTimerPassHour: function (index) {
                if (Timers.get(index)) {
                    var timer = Timers.get(index);
                    if (timer.isCountdown) {
                        return timer.total - timer.elapsed >= timerConfig.circleMax;
                    } else {
                        return timer.elapsed >= timerConfig.circleMax;
                    }
                }
            },

            getTimerColor: function (index) {
                if (Timers.get(index)) {
                    var timer = Timers.get(index);
                    if (!timer.isCountdown) {
                        return "#fff";
                    }
                    var timeLeft = 0;
                    if (timer.isCountdown) {
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
                var timer = Timers.get(ind);
                var format = timer.isCountdown ? "-HH:mm:ss" : "HH:mm:ss";
                return moment.duration(timer.current, 'seconds').format(format, {trim: false});
            }
        }
    })
    .controller('TimersCtrl', function ($scope, $rootScope, AppState, Timers, timerConfig, TimerCommon, Api) {
        $scope.selectedTimerIndex = 0;

        Api.timers.query(function (timers) {
            Timers.replace(timers);
        });

        $rootScope.$on('push', function (event, message) {
            if (message.type == 'timers') {
                Api.timers.query(function (timers) {
                    Timers.replace(timers);
                });
            }
        });

        $scope.onInitButtonsSvg = function () {
            var buttonsSnap = Snap("#timer-buttons");
            buttonsSnap.select("#Chrono").click(function () {
                $scope.setTimer();
            });
            buttonsSnap.select("#Timer").click(function () {
                $scope.setCountDown();
            });
        };

        $scope.getTimer = function (ind) {
            return Timers.get(ind);
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

        $rootScope.$on('timerTick', function () {
            for (var i = 0; i < Timers.count(); i++) {
                var timer = Timers.get(i);
                if (!Timers.isActive(i)) {
                    continue;
                }
                if (timer.isCountdown) {
                    $scope.updateCountdown(i, timer);
                } else {
                    $scope.updateTimer(i, timer);
                }
            }
        });

        $scope.updateTimer = function (index, timer) {
            if (timer.elapsed >= timer.total) {
                timer.elapsed = timer.total;
                Timers.setActive(index, false);
            } else {
                timer.elapsed += timerConfig.tick;
            }

            if (timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }

            Timers.set(index, timer);
        };

        $scope.updateCountdown = function (index, timer) {
            if (timer.elapsed <= 0) {
                timer.elapsed = 0;
                Timers.setActive(index, false);
            } else {
                timer.elapsed -= timerConfig.tick;
            }

            if (timer.total - timer.elapsed > timerConfig.circleMax) {
                timer.current = timer.current - timerConfig.circleMax * (timer.current / timerConfig.circleMax);
            } else {
                timer.current = timer.elapsed;
            }

            Timers.set(index, timer);
        };

        $scope.activeTimerName = function () {
            if (Timers.get($scope.selectedTimerIndex)) {
                var index = $scope.selectedTimerIndex + 1;
                return index;
            } else {
                return "";
            }
        };

        $scope.activeTimerValue = function () {
            if (Timers.get($scope.selectedTimerIndex)) {
                var format = Timers.get($scope.selectedTimerIndex).isCountdown ? "-HH:mm:ss" : "HH:mm:ss";
                return moment.duration(Timers.get($scope.selectedTimerIndex).current, 'seconds').format(format, {trim: false});
            } else {
                return "";
            }
        };

        $scope.cycle = function () {
            if ($scope.selectedTimerIndex + 1 >= Timers.count()) {
                $scope.selectedTimerIndex = 0;
            } else {
                $scope.selectedTimerIndex++;
            }
        };

        $scope.timeLeft = function (index) {
            return TimerCommon.timeLeft(index);
        };

        $scope.removeTimer = function (index) {
            var timer = Timers.get(index);
            if (!timer.eventId) {
                Timers.setActive(index, false);
                Timers.remove(index);
                Api.timers.delete({timerId: timer.id});

                if (Timers.count() == 0) {
                    $scope.selectedTimer = null;
                } else {
                    $scope.selectedTimerIndex = 0;
                }
            }
        };

        $scope.isActive = function (index) {
            return Timers.isActive(index);
        };

        $scope.playPause = function (index) {
            var active = !Timers.isActive(index);
            Timers.setActive(index, active);
            var timer = Timers.get(index);
            Api.timers.update({timerId: timer.id}, {isActive: active});
        };

        $scope.$watch(
            function () {
                return Timers.count();
            },
            function () {
                $scope.timerz = Timers;
                $scope.selectedTimerIndex = Timers.count() - 1;
            },
            true);

    })
    .controller('SetTimerCtrl', function ($scope, $rootScope, AppState, Api, Timers) {
        $scope.timer = new Date("1/1/16 0:00");

        $rootScope.$on('close', function (event, data) {
            if (data == 'set-timer') {
                var totalTime = $scope.timer.getSeconds() + $scope.timer.getMinutes() * 60 + $scope.timer.getHours() * 3600;
                if (totalTime == 0) {
                    return;
                }

                var timer = {
                    totalTime: totalTime,
                    isCountdown: AppState.isNewCountdown()
                };
                Api.timers.save(timer, function (newTimer) {
                    Timers.add(newTimer);
                });

                $scope.timer = new Date("1/1/16 0:00");
            }
        });
    });