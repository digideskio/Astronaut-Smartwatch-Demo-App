var express = require('express');
var router = express.Router();
var _ = require('underscore');
var eventsModel = require('../data/eventData');
var userModel = require('../data/userData');
var roleModel = require('../data/roleData');
var moment = require('moment');
var ws = require('../websocket');

function sortEvents() {
    eventsModel.events.sort(function (l, r) {
        var a = moment(l.date + " " + l.startTime, "DD/MM/YYYY HH:mm");
        var b = moment(r.date + " " + r.startTime, "DD/MM/YYYY HH:mm");
        return b.isBefore(a);
    })
}

var criticalityOptions = ['Low', 'High'];
var statusOptions = ['Scheduled', 'Canceled'];

router.get('/', function (req, res, next) {
    res.render('events', {
        title: 'Events',
        list: eventsModel,
        users: userModel.users,
        roles: roleModel.roles
    });
});

router.get('/add', function (req, res) {
    res.render('eventAdd', {
        title: 'Add Event',
        users: userModel.users,
        roles: roleModel,
        criticalityOptions: criticalityOptions,
        statusOptions: statusOptions
    });
});

router.get('/:eventId/edit', function (req, res) {
    var eventId = Number(req.params.eventId);
    var filteredEvent = eventsModel.events.find(function (e) {
        console.log("Comparing " + eventId + " and " + e.id);
        return e.id == eventId;
    });
    console.log("Editing event " + filteredEvent.name);
    res.render('eventEdit', {
        title: 'Event Edit',
        event: filteredEvent,
        users: userModel.users,
        roles: roleModel.roles,
        criticalityOptions: criticalityOptions,
        statusOptions: statusOptions
    });
});

router.get('/:eventId/delete', function (req, res) {
    var eventId = Number(req.params.eventId);
    for (var i = 0; i < eventsModel.events.length; i++) {
        if (eventsModel.events[i].id == eventId) {
            eventsModel.events.splice(i, 1);
            break;
        }
    }
    sortEvents();
    res.location('/admin/events');
    res.redirect('/admin/events');
});

router.post('/:eventId/edit', function (req, res) {
    var eventId = req.params.eventId;
    console.log("Editing event : ", req.body.name);
    console.log('New data = %O', req.body);
    var eventIndex = _.findIndex(eventsModel.events, function (e) {
        return e.id == eventId
    });
    console.log('INDEX = ' + eventIndex);
    eventsModel.events[eventIndex] = req.body;
    eventsModel.events[eventIndex].id = eventId;
    sortEvents();
    res.location('/admin/events');
    res.redirect('/admin/events');
});

router.post('/', function (req, res) {
    var newEvent = req.body;
    if (eventsModel.events.length > 0) {
        newEvent.id = eventsModel.events[eventsModel.events.length - 1].id + 1;
    } else {
        newEvent.id = 0;
    }
    eventsModel.events.push(newEvent);
    sortEvents();
    ws.broadcast(JSON.stringify({
        event: 'event',
        data: newEvent
    }));
    res.location('admin/events');
    res.redirect('admin/events');

});

module.exports = router;