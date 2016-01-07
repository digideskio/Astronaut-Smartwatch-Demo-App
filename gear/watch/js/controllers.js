angular.module("Watch", ['ngRoute', 'ngResource', 'angular.filter', 'infinite-scroll'])
    .factory("EventsService", function ($resource) {
        return $resource('http://10.0.0.184\:3000/api/events/:role/:day', {role: '@_role', day: '@_day'});
    })
    .factory("RolesApi", function ($resource) {
        return $resource('http://10.0.0.184\:3000/api/roles/:role', {role: '@_role'});
    })
    .config(function ($routeProvider) {
        //$routeProvider.when('/users/:id', {templateUrl:'/assets/templates/user/editUser.html', controller:controllers.UserCtrl});
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
    .controller('TimelineCtrl', function ($scope, EventsService, RoleService) {
        moment.locale('en-gb');
        $scope.busy = false;
        $scope.lastQueriedDate = moment();
        $scope.activeRole = RoleService.get();

        EventsService.get({role: 'none', day: $scope.lastQueriedDate.format("L")}, function (data) {
            $scope.activeRole = data.role;
            $scope.events = data.events;
        });

        $scope.refresh = function () {
            EventsService.get({role: $scope.activeRole, day: $scope.lastQueriedDate.format("L")}, function (data) {
                console.log(data);
                $scope.activeRole = data.role;
                $scope.events = $scope.events.concat(data.events);
                console.log("%O", $scope.events);
                $scope.busy = false;
            })
        };

        $scope.nextPage = function () {
            $scope.busy = true;
            $scope.lastQueriedDate = $scope.lastQueriedDate.add(1, 'days');
            console.log("next page for " + $scope.lastQueriedDate.format('L'));
            $scope.refresh();
        };

        $scope.selectRole = function () {
            tau.changePage('roles');
        };

        $scope.$watch(
            function () {
                return RoleService.get();
            },
            function (newVal, oldVal) {
                console.log("NEW VAL");
                if (newVal !== oldVal) {
                    $scope.events = [];
                    $scope.busy = true;
                    $scope.activeRole = newVal;
                    $scope.lastQueriedDate = moment();
                    $scope.refresh();
                    $scope.$emit('role-selected');
                }
            },
            true);
    })
    .controller('CommsCtrl', function ($scope, $rootScope) {

    })
    .controller('TimersCtrl', function ($scope, $rootScope) {

    })
    .controller('AlertsCtrl', function ($scope, $rootScope) {

    })
    .controller('HeaderCtrl', function ($scope, $interval, RoleService) {
        $scope.activeRole = RoleService.get();
        $scope.time = new Date();
        $interval(function () {
            $scope.time = new Date();
        }, 1000);

        $scope.goBack = function () {
            console.log("Going back to timeline");
            tau.back();
        };
    })
    .controller('RolesCtrl', function ($scope, $interval, RoleService, RolesApi) {
        $scope.activeRole = RoleService.get();
        $scope.roles = RolesApi.query();

        $scope.goBack = function () {
            console.log("Going back to timeline");
            tau.back();
        };

        $scope.selectRole = function (name) {
            console.log("New active role = " + name);
            RoleService.set(name);
            $scope.goBack();
        };
    });
