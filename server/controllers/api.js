var express = require('express');
var router = express.Router();
var cors = require('cors');
var eventsModel = require('../data/eventData');
var rolesModel = require('../data/roleData');
var alertsModel = require('../data/alertData');
var commsModel = require('../data/commsData');
var timersModel = require('../data/timersData.js');
var moment = require('moment');
require('moment-range');
var _ = require('underscore');
var ws = require('../websocket');

var MAX_TIMER_COUNT = 3;
var PAGE_SIZE = 5;

function updateTimer(timer) {
    if (timer.elapsed >= timer.total) {
        timer.elapsed = timer.total;
        timer.isActive = false;
    } else {
        timer.elapsed += 1;
    }
}

function updateCountdown(timer) {
    if (timer.elapsed <= 0) {
        timer.elapsed = 0;
        timer.isActive = false;
    } else {
        timer.elapsed -= 1;
    }
}

setInterval(function () {
    _.each(timersModel.timers, function (t) {
        if (t.isActive) {
            if (t.isCountdown) {
                updateCountdown(t);
            } else {
                updateTimer(t);
            }
        }
    });
}, 1000);

function addTimer(isCountdown, eventId, total) {
    var newTimer = {};
    if (timersModel.timers.length > 0) {
        newTimer.id = timersModel.timers[timersModel.timers.length - 1].id + 1;
    } else {
        newTimer.id = 0;
    }
    newTimer.isCountdown = isCountdown;
    newTimer.isActive = true;
    newTimer.start = moment();
    newTimer.total = total;
    newTimer.elapsed = newTimer.isCountdown ? newTimer.total : 0;
    if (eventId != null) {
        var event = _.find(eventsModel.events, function (e) {
            return e.id == eventId
        });
        newTimer.name = event.name;
    } else {
        newTimer.name = "Custom Timer " + timersModel.timers.length + 1;
    }

    timersModel.timers.push(newTimer);
    return newTimer;
}

router.get('/events', function (req, res) {
    res.json(eventsModel.events);
});

router.get('/events/:role/:page', function (req, res) {
    var page = req.params.page;
    var role = req.params.role;
    if (!role || role == 'none') {
        console.log("role = " + role);
        role = rolesModel.roles[0].name;
    }

    console.log("role = " + role);
    var now = moment();
    var filteredEvents = eventsModel.events.filter(function (e) {
        var endTime = moment(e.date + " " + e.endTime, "MM/DD/YYYY HH:mm");
        return endTime.isAfter(now) && e.roles && e.roles.indexOf(role) > -1;
    });

    var roleEvents = eventsModel.events.filter(function (e) {
        return e.roles && e.roles.indexOf(role) > -1;
    });

    //TODO: hack to send 20 previous events with first page of current events
    if (page == 0) {
        var firstPageIndex = _.findIndex(roleEvents, function (e) {
            var endTime = moment(e.date + " " + e.endTime, "MM/DD/YYYY HH:mm");
            return endTime.isAfter(now) && e.roles && e.roles.indexOf(role) > -1;
        });

        var index = firstPageIndex - 20;
        if (index < 0) {
            index = 0;
        }

        var events = roleEvents.slice(index, 20 + PAGE_SIZE);
        filteredEvents = _.uniq(events.concat(filteredEvents));
        var response = {
            role: role,
            events: filteredEvents,
            firstEventIndex: firstPageIndex
        };
    } else {

        var index = page * PAGE_SIZE;

        if (index <= filteredEvents.length) {
            filteredEvents = filteredEvents.slice(index, index + PAGE_SIZE);
            console.error("Start = " + page * PAGE_SIZE + " pgSize = " + PAGE_SIZE + " GOT = " + filteredEvents.length);
        } else {
            filteredEvents = [];
        }

        var response = {
            role: role,
            events: filteredEvents
        };
    }
    console.error("Processed page " + page + ". Events count = " + filteredEvents.length + ". Total = " + eventsModel.events.length);
    res.json(response);
});


router.put('/events/:eventId', function (req, res) {
    var event = _.find(eventsModel.events, function (e) {
        return e.id == req.params.eventId;
    });

    event.isActive = req.body.isActive;
    event.isCompleted = req.body.isCompleted;

    if (event.isActive) {
        event.startTime = moment().format("HH:mm");
    } else if (event.isCompleted) {
        event.endTime = moment().format("HH:mm");
    }

    var timer = _.filter(timersModel.timers, function (t) {
        return t.eventId == req.params.eventId
    });

    if (timer !== undefined) {
        timer.isActive = req.body.isActive && !req.body.isCompleted;
    }

    ws.broadcast(JSON.stringify({
        event: 'event',
        data: event
    }));

    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: timer
    }));

    res.json(event);
});

router.post('/events/:eventId/timer', function (req, res) {
    if (timersModel.timers.length >= MAX_TIMER_COUNT) {
        res.sendStatus(403);
        return;
    }
    var event = _.find(eventsModel.events, function (e) {
        return e.id == req.params.eventId;
    });
    event.hasTimer = true;

    var now = moment();
    var start = moment(event.date + " " + event.startTime, "MM/DD/YYYY HH:mm");
    var end = moment(event.date + " " + event.endTime, "MM/DD/YYYY HH:mm");
    var total = event.isActive ? moment.range(now, end) : moment.range(now, start);
    var timer = addTimer(!event.isActive, event.id, total.valueOf() / 1000);

    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: timer
    }));

    res.json(timer);
});

router.get('/roles', function (req, res) {
    res.json(rolesModel.roles);
});

router.get('/alerts', function (req, res) {
    res.json(alertsModel.alerts);
});

router.get('/comms', function (req, res) {
    res.json(commsModel);
});

router.get('/timers', function (req, res) {
    res.json(timersModel.timers);
});

router.post('/timers', function (req, res) {
    if (timersModel.timers.length >= MAX_TIMER_COUNT) {
        res.sendStatus(403);
        return;
    }

    var newTimer = addTimer(req.body.isCountdown, null, req.body.totalTime);
    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: newTimer
    }));

    res.json(newTimer);
});

router.delete('/timers/:timerId', function (req, res) {
    var timerId = Number(req.params.timerId);
    var timerIndex = _.findIndex(timersModel.timers, function (t) {
        return t.id == timerId
    });
    timersModel.timers.splice(timerIndex, 1);
    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: timersModel.timers
    }));
    res.sendStatus(200);
});

router.put('/timers/:timerId', function (req, res) {
    var timer = _.find(timersModel.timers, function (t) {
        return t.id == req.params.timerId;
    });

    if (timer && !timer.eventId) {
        timer.isActive = req.body.isActive;
    }

    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: timer
    }));

    res.json(timer);
});

router.get('/time', function (req, res) {
    res.json({
        time: moment().unix()
    });
});

module.exports = router;
