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
    .constant('DefaultServerAddress', '10.0.0.75')
    .constant('RefreshInterval', '60000')  // once a minute
    .constant('DefaultRestPort', 3000)
    .constant('WebsocketPort', 3001)
    .factory("Api", function ($rootScope, $resource, $interval, $cacheFactory, $http, DefaultServerAddress, DefaultRestPort, AppState, RefreshInterval) {
        var apiCache = $cacheFactory('api');
        var serverUrl = DefaultServerAddress + ":" + DefaultRestPort;

        var getEndpoint = function () {
            return 'http://' + serverUrl + '/api';
        };

        var api = {
            events: function () {
                return $resource(getEndpoint() + '/events/:role/:page/:eventId', {
                        role: '@_role',
                        page: '@_page',
                        eventId: '@_eventId'
                    }, {
                        'update': {method: 'PUT'}
                    }, {cache: apiCache}
                )
            },
            alerts: function () {
                return $resource(getEndpoint() + '/alerts/:alert', {
                    alert: '@_alert'
                }, {cache: apiCache})
            },
            alertAck: function () {
                return $resource(getEndpoint() + '/alerts/:alertId/ack/:roleId', {
                        alertId: '@_alertId',
                        roleId: '@_roleId'
                    }, {
                        'update': {method: 'PUT'}
                    }, {cache: apiCache}
                )
            },
            roles: function () {
                return $resource(getEndpoint() + '/roles/:role', {
                    role: '@_role'
                }, {cache: apiCache})
            },
            comms: function () {
                return $resource(getEndpoint() + '/comms/:commId', {
                        commId: '@_commId'
                    },
                    {cache: apiCache})
            },
            timers: function () {
                return $resource(getEndpoint() + '/timers/:roleId/:timerId', {
                    roleId: '@_roleId',
                    timerId: '@_timerId'
                }, {
                    'update': {method: 'PUT'}
                })
            },
            eventTimers: function () {
                return $resource(getEndpoint() + '/events/:eventId/timer', {
                    eventId: '@_eventId'
                })
            },
            time: function () {
                return $resource(getEndpoint() + '/time', null, {
                    query: {
                        method: 'GET',
                        isArray: false
                    }
                })
            }
        };

        $rootScope.$watch(
            function () {
                return AppState.getServer();
            },
            function (newVal) {
                if (newVal) {
                    serverUrl = newVal;
                    $rootScope.$emit('push', {
                        type: 'server',
                        data: null
                    });
                }
            },
            true);

        $interval(function () {
            $cacheFactory.removeAll();
            $rootScope.$emit('refresh');

            updateTime();
        }, RefreshInterval);


        var updateTime = function () {
            api.time().query(function (data) {
                var timestamp = parseInt(data.time);
                var time = moment.unix(timestamp);
                AppState.setTime(time);
            });
        };

        updateTime();
        return api;
    })
    .run(function ($rootScope, $cacheFactory, $websocket, DefaultServerAddress, WebsocketPort, AppState) {
        var createWebSocket = function (serverAddress) {
            var ws = $websocket.$new('ws://' + serverAddress + ':' + WebsocketPort);
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
        };

        var socket = createWebSocket(DefaultServerAddress);

        $rootScope.$watch(
            function () {
                return AppState.getServer();
            },
            function (newVal) {
                if (newVal) {
                    if (socket && socket.$ready()) {
                        socket.$close();
                        var url = newVal.splice(0, newVal.lastIndexOf(':'));
                        socket = createWebSocket(url);
                    }
                }
            },
            true);
    });