angular.module('Watch')
    .factory('AppState', function () {
        tau.defaults.pageTransition = "slideup";

        var currentState = {
            currentScreen: '',
            activeRole: '',
            event: {},
            alert: {},
            isNewTimerCountdown: false,
            timersInfo: {
                timers: [],
                get: function (ind) {
                    return this.timers[ind];
                },
                set: function(ind, timer) {
                    this.timers[ind] = timer;
                },
                count: function() {
                    return this.timers.length;
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

        currentState.totalTimers = function () {
            return currentState.timersInfo.count();
        };

        return currentState;
    });