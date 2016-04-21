angular.module('Watch')
    .config(['$provide',
        function ($provide) {
            $provide.decorator('$cacheFactory', function ($delegate) {
                $delegate.removeAll = function () {
                    angular.forEach($delegate.info(), function (ob, key) {
                        $delegate.get(key).removeAll();
                    });
                };

                $delegate.destroyAll = function () {
                    angular.forEach($delegate.info(), function (ob, key) {
                        $delegate.get(key).destroy();
                    });
                };
                return $delegate;
            });
        }
    ])
    .constant('ServerAddress', '10.0.0.75')
    .constant('RefreshInterval', '60000')  // once a minute
    .constant('RestPort', 3000)
    .constant('WebsocketPort', 3001)
    .factory("Api", function ($rootScope, $resource, $interval, $cacheFactory, ServerAddress, RestPort, AppState, RefreshInterval) {
        var serverUrl = ServerAddress + ":" + RestPort;
        var apiEndpoint = 'http://' + serverUrl + '/api';
        var apiCache = $cacheFactory('api');

        $rootScope.$watch(
            function () {
                return AppState.getServer();
            },
            function (newVal) {
                serverUrl = newVal;
            },
            true);

        $interval(function () {
            $cacheFactory.removeAll();
            $rootScope.$emit('refresh');
        }, RefreshInterval);

        return {
            events: $resource(apiEndpoint + '/events/:role/:page/:eventId', {
                    role: '@_role',
                    page: '@_page',
                    eventId: '@_eventId'
                }, {
                    'update': {method: 'PUT'}
                }, {cache: apiCache}
            ),
            alerts: $resource(apiEndpoint + '/alerts/:alert', {
                alert: '@_alert'
            }, {cache: apiCache}),
            roles: $resource(apiEndpoint + '/roles/:role', {
                role: '@_role'
            }, {cache: apiCache}),
            comms: $resource(apiEndpoint + '/comms/:commId', {
                commId: '@_commId'
            }, {cache: apiCache}),
            timers: $resource(apiEndpoint + '/timers/:timerId', {
                timerId: '@_timerId'
            }, {
                'update': {method: 'PUT'}
            }),
            eventTimers: $resource(apiEndpoint + '/events/:eventId/timer', {
                eventId: '@_eventId'
            })
        }
    })
    .run(function ($rootScope, $cacheFactory, $websocket, ServerAddress, WebsocketPort, Api) {
        var ws = $websocket.$new('ws://' + ServerAddress + ':' + WebsocketPort);
        ws.$on('$open', function () {
            console.info("Websocket connection open");
        });

        ws.$on('$close', function () {
            console.info("Websocket connection closed");
        });

        ws.$on('alert', function (data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'alert',
                data: data
            });
        });

        ws.$on('comms', function (data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'comms',
                data: data
            });
        });

        ws.$on('event', function (data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'event',
                data: data
            });
        });

        ws.$on('timers', function (data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'timers',
                data: data
            });
        });

        ws.$on('upload', function (data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'upload',
                data: data
            });
        });

        ws.$on('roles', function (data) {
            $rootScope.$emit('push', {
                type: 'roles',
                data: data
            });
        });

        ws.$on('delete', function (data) {
            $rootScope.$emit('push', {
                type: 'delete',
                data: data
            });
        });
    });