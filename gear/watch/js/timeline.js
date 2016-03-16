angular.module('Watch')
    .controller('TimelineCtrl', function ($rootScope, $scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = true;
        $scope.activeRole = AppState.getActiveRole() || 'ISS CDR';
        $scope.currentPage = 0;

        $scope.refresh = function () {
            $scope.currentPage = 0;
            Api.events.get({role: $scope.activeRole, page: $scope.currentPage}, function (data) {
                $scope.activeRole = data.role;
                $scope.busy = false;
                $scope.events = data.events;
            });
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

        $scope.fetchNew = function () {
            $scope.currentPage++;
            Api.events.get({role: $scope.activeRole, page: $scope.currentPage}, function (data) {
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