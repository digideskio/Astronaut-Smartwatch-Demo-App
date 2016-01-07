var express = require('express');
var router = express.Router();
var cors = require('cors');
var eventsModel = require('../data/eventData');
var rolesModel = require('../data/roleData');


router.get('/events', function (req, res, next) {
    res.json(eventsModel.events);
});

router.get('/events/:role/:date', function(req, res, next) {
    var date = req.params.date;
    var role = req.params.role;
    if(!role || role == 'none') {
        console.log("role = " + role);
        role = rolesModel.roles[0].name;
    }

    console.log("role = " + role);
    var filteredEvents = eventsModel.events.filter(function(e) {
        return e.date == date && e.role == role;
    });

    var response = {
        role: role,
        events: filteredEvents
    };

    res.json(response);
});

router.get('/roles', function(req, res) {
   res.json(rolesModel.roles);
});

module.exports = router;
