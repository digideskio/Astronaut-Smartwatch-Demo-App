angular.module('Watch')
    .factory('AppState', function () {
        tau.defaults.pageTransition = "slideup";

        var currentState = {
            currentScreen: '',
            activeRole: '',
            event: {},
            alert: {},
            isNewTimerCountdown: false,
            activeTimer: 0,
            timersInfo: {
                timers: [],
                get: function (ind) {
                    return this.timers[ind];
                },
                set: function (ind, timer) {
                    this.timers[ind] = timer;
                },
                remove: function (ind) {
                    console.error("REMOVEING!!");
                    this.timers.splice(ind, 1);
                    console.error("TOOTT " + this.timers.length);
                },
                count: function () {
                    return this.timers.length;
                },
                setActive: function (index, active) {
                    this.timers[index].active = active;
                },
                isActive: function (index) {
                    if (this.timers.length == 0) {
                        return false;
                    } else {
                        var timer = this.timers[index];
                        if (timer) {
                            return timer.active;
                        } else {
                            return false;
                        }
                    }
                }
            }
        };

        currentState.getActiveRole = function () {
            return currentState.activeRole;
        };

        currentState.getTimer = function (index) {
            return currentState.timersInfo.get(index);
        };

        currentState.setTimer = function (index, timer) {
            currentState.timersInfo.set(index, timer);
        };

        currentState.setActive = function (index, active) {
            currentState.timersInfo.setActive(index, active);
        };

        currentState.isActive = function (index) {
            return currentState.timersInfo.isActive(index);
        };

        currentState.removeTimer = function (index) {
            currentState.timersInfo.remove(index);
        };

        currentState.totalTimers = function () {
            return currentState.timersInfo.count();
        };

        currentState.isNewCountdown = function () {
            return currentState.isNewTimerCountdown;
        };

        currentState.setNewCountdown = function (isCountdown) {
            currentState.isNewTimerCountdown = isCountdown;
        };

        return currentState;
    });