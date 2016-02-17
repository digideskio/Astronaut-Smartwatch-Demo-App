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
    .constant('serverAddress', '10.0.0.75')
    //.constant('serverAddress', 'localhost')
    .constant('restPort', 3000)
    .constant('websocketPort', 3001)
    .factory("Api", function ($resource, serverAddress, restPort, $cacheFactory) {
        var apiEndpoint = 'http://' + serverAddress + ':' + restPort + '/api';
        var apiCache = $cacheFactory('api');
        return {
            events: $resource(apiEndpoint + '/events/:role/:page', {
                role: '@_role',
                page: '@_page'
            }, {cache: apiCache}),
            alerts: $resource(apiEndpoint + '/alerts/:alert', {
                alert: '@_alert'
            }, {cache: apiCache}),
            roles: $resource(apiEndpoint + '/roles/:role', {
                role: '@_role'
            }, {cache: apiCache}),
            comms: $resource(apiEndpoint + '/comms/:commId', {
                commId: '@_commId'
            }, {cache: apiCache})
        }
    })
    .run(function ($rootScope, $cacheFactory, $websocket, serverAddress, websocketPort, Api) {
        var ws = $websocket.$new('ws://' + serverAddress + ':' + websocketPort);
        ws.$on('$open', function () {
            console.info("Websocket connection open");
        });

        ws.$on('$close', function () {
            console.info("Websocket connection closed");
        });

        ws.$on('alert', function (data) {
            $cacheFactory.removeAll();
            Api.alerts.query();
            $rootScope.$emit('push', {
                type: 'alert',
                data: data
            });
        });

        ws.$on('comms', function (data) {
            $cacheFactory.removeAll();
            Api.comms.query();
            $rootScope.$emit('push', {
                type: 'comms',
                data: data
            });
        });

        ws.$on('event', function(data) {
            $cacheFactory.removeAll();
            $rootScope.$emit('push', {
                type: 'event',
                data: data
            });
        });

        ws.$on('$message', function (data) {
            console.info("New message received : " + data);
        });


    });