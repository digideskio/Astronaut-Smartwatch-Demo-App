angular.module('Watch')
    .controller('TimelineCtrl', function ($scope, Api, AppState) {
        moment.locale('en-gb');
        $scope.busy = true;
        $scope.lastQueriedDate = moment();
        $scope.activeRole = AppState.getActiveRole() || 'none';

        Api.events.get({role: 'none', day: $scope.lastQueriedDate.format("L")}, function (data) {
            $scope.activeRole = data.role;
            $scope.events = data.events;
            $scope.busy = false;
        });

        $scope.showEvent = function (event) {
            AppState.event = event;
            console.log("New active event = " + AppState.event.name);
            AppState.currentScreen = 'event-details';
            tau.changePage('event-details');
        };

        $scope.refresh = function () {
            Api.events.get({role: $scope.activeRole, day: $scope.lastQueriedDate.format("L")}, function (data) {
                $scope.busy = false;
                $scope.activeRole = data.role;
                $scope.events = $scope.events.concat(data.events);
            }, function (err) {
            })
        };

        $scope.nextPage = function () {
            $scope.busy = true;
            $scope.lastQueriedDate = $scope.lastQueriedDate.add(1, 'days');
            $scope.refresh();
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