angular.module('Watch')
    .controller('TimelineCtrl', function ($rootScope, $scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = true;
        $scope.activeRole = AppState.getActiveRole() || 'ISS CDR';
        $scope.currentPage = 0;

        $scope.refresh = function () {
            $scope.currentPage = 0;
            Api.events().get({role: $scope.activeRole, page: $scope.currentPage}, function (data) {
                $scope.activeRole = data.role;
                $scope.busy = false;
                $scope.events = data.events;
                $scope.pendingScroll = true;
                $scope.firstEventIndex = data.firstEventIndex;
            }, function(err) {
                $scope.busy = false;
            });
        };

        $scope.activate = function () {
            if ($scope.pendingScroll && $scope.firstEventIndex != -1) {
                setTimeout(function () {
                    var top = $('#event-' + $scope.firstEventIndex).offset().top;
                    $('#tm-sc').animate({
                        scrollTop: top
                    }, 200);
                }, 500);
            }
        };

        $scope.showEvent = function (event) {
            AppState.event = event;
            console.log("New active event = " + AppState.event.name);
            AppState.currentScreen = 'event-details';
            tau.changePage('event-details');
        };

        $rootScope.$on('push', function () {
            $scope.refresh();
        });

        $rootScope.$on('refresh', function () {
            $scope.refresh();
        });

        $scope.fetchNew = function () {
            $scope.currentPage++;
            Api.events().get({role: $scope.activeRole, page: $scope.currentPage}, function (data) {
                $scope.busy = false;
                $scope.activeRole = data.role;
                $scope.events = $scope.events.concat(data.events);
            }, function (err) {
            })
        };

        $scope.nextPage = function () {
            $scope.busy = true;
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
                $scope.refresh();
                $scope.$emit('role-selected');
            },
            true);
    })
    .controller('RolesCtrl', function ($rootScope, $scope, $interval, AppState, Api) {
        $scope.activeRole = AppState.activeRole;
        $scope.roles = Api.roles().query();

        $scope.goBack = function () {
            tau.back();
        };

        $rootScope.$on('push', function () {
            $scope.roles = Api.roles().query();
        });

        $rootScope.$on('refresh', function () {
            $scope.roles = Api.roles().query();
        });

        $scope.selectRole = function (name) {
            AppState.activeRole = name;
            $scope.goBack();
        };
    })
    .controller('EventDetailCtrl', function ($rootScope, $scope, AppState, Api, Timers) {
        $scope.currentData = AppState;

        $scope.startEvent = function () {
            AppState.event.status = 'active';

            Api.events().update({eventId: AppState.event.id}, {
                status: 'active'
            }, function (ev) {
                AppState.event = ev;
            });
        };

        $scope.stopEvent = function () {
            AppState.event.status = 'completed';

            Api.events().update({eventId: AppState.event.id}, {
                status: 'completed'
            });
        };

        $scope.updateEventTime = function () {
            if (AppState.event) {
                var start = moment(AppState.event.date + " " + AppState.event.startTime, "MM/DD/YYYY HH:mm");
                var end = moment(AppState.event.date + " " + AppState.event.endTime, "MM/DD/YYYY HH:mm");
                if (AppState.event.status == 'active' || start.isAfter(moment())) {
                    $scope.formatAndSaveEventDuration(moment().diff(start));
                }
                if (AppState.event.status == 'completed') {
                    $scope.formatAndSaveEventDuration(end.diff(start));
                }
            }
        };

        $scope.formatAndSaveEventDuration = function (diff) {
            var duration = moment.duration(diff);
            $scope.eventStatus = moment.duration(duration).format("HH:mm:ss", {
                forceLength: true,
                trim: false
            });
        };

        $rootScope.$on('timerTick', function () {
            $scope.updateEventTime();
        });

        $rootScope.$on('push', function (message) {
            if (message.type == 'event' && message.data.id == AppState.event.id) {
                AppState.event = message.data;
            }
        });

        $scope.trackTime = function () {
            if (!AppState.event.hasTimer) {
                Api.eventTimers().save({eventId: AppState.event.id}, {}, function (timer) {
                    AppState.event.hasTimer = true;
                    Timers.add(timer);
                }, function () {
                    alert("Reached max number of timers!");
                });
            }
        };


        $scope.shouldShowAddTimer = function () {
            if (AppState.event.status == 'completed' || AppState.event.hasTimer) {
                return false;
            }

            var start = moment(AppState.event.date + " " + AppState.event.startTime, "MM/DD/YYYY HH:mm");
            if (AppState.event.status == 'scheduled' && start.isAfter(moment())) {
                return true;
            }

            if (AppState.event.status == 'active' && !AppState.event.hasTimer) {
                return true;
            }
        };

        $scope.shouldShowStartEvent = function () {
            return AppState.event.status == 'scheduled';
        };

        $scope.shouldShowStopEvent = function () {
            return AppState.event.status == 'active';
        };

        $scope.updateEventTime();
    });