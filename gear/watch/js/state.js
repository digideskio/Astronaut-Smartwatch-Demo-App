angular.module('Watch')
    .factory('AppState', function () {
        var currentState = {
            isNewTimerCountdown: false,
            server: null,
            events: {
                current: null,
                next: null,

                getCurrent: function () {
                    return this.current;
                },

                getNext: function () {
                    return this.next;
                }
            },
            currentScreen: '',
            activeRole: 'ISS CDR',
            event: {},
            alert: {}
        };

        currentState.getActiveRole = function () {
            return currentState.activeRole;
        };

        currentState.getTimer = function (index) {
            return currentState.timersInfo.get(index);
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

        currentState.getServer = function () {
            return currentState.server;
        };

        currentState.setServer = function (server) {
            currentState.server = server;
        };

        return currentState;
    })
    .controller('SetupServerCtrl', function($rootScope, $scope, AppState) {
        $scope.server = "10.0.0.75:3000";

        $scope.save = function() {
            AppState.setServer($scope.server);
            tau.changePage('dashboard');
        }
    });