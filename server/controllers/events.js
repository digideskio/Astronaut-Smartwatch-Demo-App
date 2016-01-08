var express = require('express');
var router = express.Router();

var eventsModel = require('../data/eventData');

router.get('/', function (req, res, next) {
    res.render('events', {
        title: 'Events',
        list: eventsModel
    });
});

router.get('/add', function (req, res) {
    res.render('eventAdd', {
        title: 'Add Event'
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
        event: filteredEvent
    });
});

router.get('/:eventId/delete', function(req, res) {
    var eventId = Number(req.params.eventId);
    for(var i=0; i < eventsModel.events.length; i++) {
        console.log("Comparing " + eventsModel.events[i].id + " and " + eventId);
        if(eventsModel.events[i].id == eventId) {
            eventsModel.events = eventsModel.events.splice(i, 1);
            res.location('/admin/events');
            res.redirect('/admin/events');
            return;
        }
    }

    res.sendStatus(404);
});

router.post('/', function (req, res) {
    console.log("Creating new event: %O", req.body);
    var newEvent = req.body;
    newEvent.id = eventsModel.events[eventsModel.events.length - 1].id + 1;
    eventsModel.events.push(newEvent);
    res.location('admin/events');
    res.redirect('admin/events');

});

module.exports = router;