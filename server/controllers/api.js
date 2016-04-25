var express = require('express');
var router = express.Router();
var cors = require('cors');
var eventsModel = require('../data/eventData');
var rolesModel = require('../data/roleData');
var alertsModel = require('../data/alertData');
var commsModel = require('../data/commsData');
var timersModel = require('../data/timersData.js');
var moment = require('moment-timezone');
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

function addTimer(role, isCountdown, eventId, total) {
    var newTimer = {};
    if (timersModel.timers[role] && timersModel.timers[role].length > 0) {
        newTimer.id = timersModel.timers[role][timersModel.timers[role].length - 1].id + 1;
    } else {
        newTimer.id = 0;
    }
    newTimer.isCountdown = isCountdown;
    newTimer.isCustom = (eventId === null);
    newTimer.isActive = true;
    newTimer.eventId = eventId;
    newTimer.start = moment();
    newTimer.total = total;
    newTimer.elapsed = newTimer.isCountdown ? newTimer.total : 0;
    if (!newTimer.isCustom) {
        var event = _.find(eventsModel.events, function (e) {
            return e.id == eventId
        });
        newTimer.name = event.name;
    } else {
        var ind = _.filter(timersModel.timers[role], function (timer) {
                return timer.isCustom;
            }).length + 1;
        newTimer.name = "Custom Timer " + ind;
    }

    if (!timersModel.timers[role]) {
        timersModel.timers[role] = [];
    }
    timersModel.timers[role].push(newTimer);
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

    event.status = req.body.status;

    if (event.status == 'active') {
        event.date = moment().format("MM/DD/YYYY");
        event.startTime = moment().format("HH:mm");
    } else if (event.status == 'completed') {
        event.endTime = moment().format("HH:mm");
    }

    for (var i = 0; i < event.roles.length; i++) {
        if (timersModel.timers[event.roles[i]]) {
            timersModel.timers[event.roles[i]] = _.reject(timersModel.timers[event.roles[i]], function (t) {
                return t.eventId == req.params.eventId;
            });
        }
    }

    ws.broadcast(JSON.stringify({
        event: 'event',
        data: event,
        show: false
    }));

    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: null
    }));

    res.json(event);
});

router.post('/events/:eventId/timer', function (req, res) {
    var event = _.find(eventsModel.events, function (e) {
        return e.id == req.params.eventId;
    });

    if (timersModel.timers[event.role] && timersModel.timers[event.role].length >= MAX_TIMER_COUNT) {
        res.sendStatus(403);
        return;
    }

    event.hasTimer = true;

    var now = moment();
    var start = moment(event.date + " " + event.startTime, "MM/DD/YYYY HH:mm");
    var end = moment(event.date + " " + event.endTime, "MM/DD/YYYY HH:mm");
    var total = event.status == 'active' ? moment.range(now, end) : moment.range(now, start);
    var countdown = event.status != 'active';

    var timer;
    for (var i = 0; i < event.roles.length; i++) {
        timer = addTimer(event.roles[i], countdown, event.id, total.valueOf() / 1000);
    }

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

router.get('/timers/:role/', function (req, res) {
    var role = req.params.role;
    res.json(timersModel.timers[role]);
});

router.post('/timers/:role/', function (req, res) {
    var role = req.params.role;
    if (timersModel.timers[role] && timersModel.timers[role].length >= MAX_TIMER_COUNT) {
        res.sendStatus(403);
        return;
    }

    var newTimer = addTimer(role, req.body.isCountdown, null, req.body.totalTime);
    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: newTimer
    }));

    res.json(newTimer);
});

router.delete('/timers/:role/:timerId', function (req, res) {
    var timerId = Number(req.params.timerId);
    var role = req.params.role;
    var timerIndex = _.findIndex(timersModel.timers[role], function (t) {
        return t.id == timerId
    });
    timersModel.timers[role].splice(timerIndex, 1);
    ws.broadcast(JSON.stringify({
        event: 'timers',
        data: timersModel.timers
    }));
    res.sendStatus(200);
});

router.put('/timers/:role/:timerId', function (req, res) {
    var role = req.params.role;
    var timer = _.find(timersModel.timers[role], function (t) {
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
        time: moment().tz('ETC/GMT').unix()
    });
});

router.put('/alerts/:alertId/ack/:role', function (req, res) {
    var alertId = req.params.alertId;
    var role = req.params.role;
    var alert = _.find(alertsModel.alerts, function (a) {
        return a.id == alertId;
    });
    if (alert) {
        if (!alert.ack) {
            alert.ack = [];
        }

        alert.ack.push(role);
    }

    res.json(alertsModel.alerts);
});

module.exports = router;
