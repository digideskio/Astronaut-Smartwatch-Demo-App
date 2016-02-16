var express = require('express');
var router = express.Router();
var cors = require('cors');
var eventsModel = require('../data/eventData');
var rolesModel = require('../data/roleData');
var alertsModel = require('../data/alertData');
var commsModel = require('../data/commsData');
var moment = require('moment');

var pageSize = 5;

router.get('/events', function (req, res, next) {
    res.json(eventsModel.events);
});

router.get('/events/:role/:page', function (req, res, next) {
    var page = req.params.page;
    var role = req.params.role;
    if (!role || role == 'none') {
        console.log("role = " + role);
        role = rolesModel.roles[0].name;
    }

    console.log("role = " + role);
    var now = moment();
    var filteredEvents = eventsModel.events.filter(function (e) {
        var endTime = moment(e.date + " " + e.endTime, "DD/MM/YYYY HH:mm");
        return endTime.isAfter(now) && e.role == role;
    });

    var index = page * pageSize;
    if (index <= filteredEvents.length) {
        filteredEvents = filteredEvents.slice(index, index + pageSize);
        console.error("Start = " + page * pageSize + " pgSize = " + pageSize + " GOT = " + filteredEvents.length);
    } else {
        filteredEvents = [];
    }

    var response = {
        role: role,
        events: filteredEvents
    };

    console.error("Processed page " + page + ". Events count = " + filteredEvents.length + ". Total = " + eventsModel.events.length);
    res.json(response);
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

module.exports = router;
