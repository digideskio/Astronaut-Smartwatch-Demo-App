angular.module('Watch')
    .controller('TimelineCtrl', function ($rootScope, $scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = true;
        $scope.lastQueriedDate = moment();
        $scope.activeRole = AppState.getActiveRole() || 'ISS CDR';

        $scope.refresh = function () {
            Api.events.get({role: $scope.activeRole, day: $scope.lastQueriedDate.format("L")}, function (data) {
                $scope.activeRole = data.role;
                $scope.busy = false;
                $scope.events = data.events;
                $scope.updateEventsState();
            });
        };

        $scope.showEvent = function (event) {
            AppState.event = event;
            console.log("New active event = " + AppState.event.name);
            AppState.currentScreen = 'event-details';
            tau.changePage('event-details');
        };

        $rootScope.$on('timerTick', function () {
            var now = moment();
            var current = AppState.events.current;
            var next = AppState.events.next;

            if (current != null) {
                var endTime = moment(current.date + " " + current.endTime, "DD/MM/YYYY HH:mm");
                if (now.isAfter(endTime)) {
                    $scope.updateEventsState();
                }
            }

            if (next != null) {
                var startTime = moment(next.date + " " + next.startTime, "DD/MM/YYYY HH:mm");
                if (now.isAfter(startTime)) {
                    $scope.updateEventsState();
                }
            }
        });

        $scope.fetchNew = function () {
            Api.events.get({role: $scope.activeRole, day: $scope.lastQueriedDate.format("L")}, function (data) {
                $scope.busy = false;
                $scope.activeRole = data.role;
                $scope.events = $scope.events.concat(data.events);
                $scope.updateEventsState();
            }, function (err) {
            })
        };

        $scope.updateEventsState = function () {
            var updatedTimers = [];
            for (var i = 0; i < AppState.timersInfo.timers.length; i++) {
                var timer = AppState.timersInfo.timers[i];
                if (timer.type != 'current' || timer.type != 'next') {
                    updatedTimers.push(timer);
                }
            }

            if ($scope.events && $scope.events.length > 0) {
                var now = moment();
                for (var j = 0; j < $scope.events.length; j++) {
                    var event = $scope.events[j];
                    var startTime = moment(event.date + " " + event.startTime, "DD/MM/YYYY HH:mm");
                    var endTime = moment(event.date + " " + event.endTime, "DD/MM/YYYY HH:mm");
                    if (now.isBetween(startTime, endTime)) {
                        $scope.addCurrentEventTimer(updatedTimers, event, now, startTime, endTime);
                    } else if (startTime.isAfter(now)) {
                        $scope.addNextEventTimer(updatedTimers, event, now, startTime);
                        break;
                    }
                }

                AppState.timersInfo.timers = updatedTimers;
            } else {
                AppState.events.current = null;
                AppState.events.next = null;
            }
        };

        $scope.addCurrentEventTimer = function (arr, event, now, start, end) {
            var elapsed = now.diff(start) / 1000;
            var total = end.diff(start) / 1000;
            arr[0] = {
                pos: 0,
                name: event.name,
                elapsed: elapsed,
                total: total,
                countdown: false,
                active: true,
                current: elapsed,
                type: 'current'
            };
        };

        $scope.addNextEventTimer = function (arr, event, now, start) {
            var elapsed = start.diff(now) / 1000;
            var total = elapsed;
            var pos = arr.length > 0 ? 1 : 0;
            arr[pos] = {
                pos: pos,
                name: event.name,
                elapsed: elapsed,
                total: total,
                countdown: true,
                active: true,
                current: elapsed,
                type: 'current'
            };
        };

        $scope.nextPage = function () {
            $scope.busy = true;
            $scope.lastQueriedDate = $scope.lastQueriedDate.add(1, 'days');
            $scope.fetchNew();
        };

        $scope.selectRole = function () {
            AppState.currentScreen = 'roles';
            tau.changePage('roles');
        };

        $scope.$watch(
            function () {
                return AppState.getActiveRole();
            },
            function (newVal) {
                $scope.events = [];
                $scope.busy = true;
                $scope.activeRole = newVal;
                $scope.lastQueriedDate = moment();
                $scope.refresh();
                $scope.$emit('role-selected');
            },
            true);
    })
    .controller('RolesCtrl', function ($scope, $interval, AppState, Api) {
        $scope.activeRole = AppState.activeRole;
        $scope.roles = Api.roles.query();

        $scope.goBack = function () {
            tau.back();
        };

        $scope.selectRole = function (name) {
            AppState.activeRole = name;
            $scope.goBack();
        };
    })
    .controller('EventDetailCtrl', function ($scope, AppState) {
        $scope.currentData = AppState;
    });