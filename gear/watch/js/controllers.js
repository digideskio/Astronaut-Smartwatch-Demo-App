angular.module("Watch", ['ngRoute', 'ngResource', 'angular.filter', 'infinite-scroll'])
    .constant('apiRoot', 'http://localhost:3000/api')
    .factory("EventsService", function ($resource, apiRoot) {
        return $resource(apiRoot + '/events/:role/:day', {role: '@_role', day: '@_day'});
    })
    .factory("AlertsService", function ($resource, apiRoot) {
        return $resource(apiRoot + '/alerts/:alert', {alert: '@_alert'});
    })
    .factory("RolesApi", function ($resource, apiRoot) {
        return $resource(apiRoot + '/roles/:role', {role: '@_role'});
    })
    .config(function ($locationProvider) {
        return $locationProvider.html5Mode(true).hashPrefix("!");
    })
    .factory('RoleService', function () {
        tau.defaults.pageTransition = "slideup";

        var activeRoleInfo = {
            name: ''
        };

        activeRoleInfo.get = function () {
            return activeRoleInfo.name;
        };

        activeRoleInfo.set = function (name) {
            activeRoleInfo.name = name;
        };

        return activeRoleInfo;
    })
    .factory('CurrentData', function () {
        return {
            event: {},
            alert: {}
        };
    })
    .controller('TimelineCtrl', function ($scope, EventsService, RoleService, CurrentData) {
        moment.locale('en-gb');
        $scope.busy = true;
        $scope.lastQueriedDate = moment();
        $scope.activeRole = RoleService.get() || 'none';

        EventsService.get({role: 'none', day: $scope.lastQueriedDate.format("L")}, function (data) {
            $scope.activeRole = data.role;
            $scope.events = data.events;
            $scope.busy = false;
        });

        $scope.showEvent = function (event) {
            CurrentData.event = event;
            console.log("New active event = " + CurrentData.event.name);
            tau.changePage('event-details');
        };

        $scope.refresh = function () {
            EventsService.get({role: $scope.activeRole, day: $scope.lastQueriedDate.format("L")}, function (data) {
                $scope.busy = false;
                $scope.activeRole = data.role;
                $scope.events = $scope.events.concat(data.events);
            }, function (err) {
                console.error("Can't receive events!");
            })
        };

        $scope.nextPage = function () {
            $scope.busy = true;
            $scope.lastQueriedDate = $scope.lastQueriedDate.add(1, 'days');
            $scope.refresh();
        };

        $scope.selectRole = function () {
            tau.changePage('roles');
        };

        $scope.$watch(
            function () {
                return RoleService.get();
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
    .controller('CommsCtrl', function ($scope, $rootScope) {

    })
    .controller('TimersCtrl', function ($scope, $rootScope) {

    })
    .controller('AlertsCtrl', function ($scope, AlertsService, CurrentData) {
        moment.locale('en-gb');
        $scope.busy = false;
        $scope.alerts = AlertsService.query();

        $scope.showAlert = function (alert) {
            CurrentData.alert = alert;
            console.log("New active alert = " + CurrentData.alert.title);
            tau.changePage('alert-details');
        };
    })
    .controller('HeaderCtrl', function ($scope, $interval) {
        $scope.time = new Date();
        $interval(function () {
            $scope.time = new Date();
        }, 1000);

        $scope.goBack = function () {
            tau.back();
        };
    })
    .controller('RolesCtrl', function ($scope, $interval, RoleService, RolesApi) {
        $scope.activeRole = RoleService.get();
        $scope.roles = RolesApi.query();

        $scope.goBack = function () {
            tau.back();
        };

        $scope.selectRole = function (name) {
            RoleService.set(name);
            $scope.goBack();
        };
    })
    .controller('EventDetailCtrl', function ($scope, CurrentData) {
        $scope.currentData = CurrentData;
    })
    .controller('AlertDetailCtrl', function ($scope, CurrentData) {
        $scope.currentData = CurrentData;
    });
