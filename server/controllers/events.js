var express = require('express');
var router = express.Router();

var eventsModel = require('../data/eventData');

router.get('/', function (req, res, next) {
    res.render('events', {
        title: 'Events',
        list: eventsModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    eventsModel.events = req.body;
    res.sendStatus(200);
});

module.exports = router;