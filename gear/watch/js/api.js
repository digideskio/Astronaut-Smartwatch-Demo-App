angular.module('Watch')
    .constant('serverAddress', '10.0.0.75')
    //.constant('serverAddress', 'localhost')
    .constant('restPort', 3000)
    .constant('websocketPort', 3001)
    .factory("Api", function ($resource, serverAddress, restPort) {
        var apiEndpoint = 'http://' + serverAddress + ':' + restPort + '/api';
        return {
            events: $resource(apiEndpoint + '/events/:role/:page', {
                role: '@_role',
                page: '@_page'
            }),
            alerts: $resource(apiEndpoint + '/alerts/:alert', {
                alert: '@_alert'
            }),
            roles: $resource(apiEndpoint + '/roles/:role', {
                role: '@_role'
            }),
            comms: $resource(apiEndpoint + '/comms/:commId', {
                commId: '@_commId'
            })
        }
    })
    .run(function ($rootScope, $websocket, serverAddress, websocketPort, Api) {
        var ws = $websocket.$new('ws://' +   serverAddress + ':' + websocketPort);
        ws.$on('$open', function() {
            console.info("Websocket connection open");
        });

        ws.$on('$close', function() {
            console.info("Websocket connection closed");
        });

        ws.$on('alert', function(data) {
            Api.alerts.query();
            $rootScope.$emit('push', {
                type: 'alert',
                data: data
            });
        });

        ws.$on('$message', function(data) {
            console.info("New message received : " + data);
        });


    });