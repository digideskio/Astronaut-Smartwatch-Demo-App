angular.module('Watch')
    .constant('apiRoot', 'http://localhost:3000/api')
    .factory("Api", function($resource, apiRoot) {
        return {
            events: $resource(apiRoot + '/events/:role/:day', {role: '@_role', day: '@_day'}),
            alerts: $resource(apiRoot + '/alerts/:alert', {alert: '@_alert'}),
            roles: $resource(apiRoot + '/roles/:role', {role: '@_role'}),
            comms: $resource(apiRoot + '/comms/:commId', {commId: '@_commId'})
        }
    });