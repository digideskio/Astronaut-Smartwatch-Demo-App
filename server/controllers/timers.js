var express = require('express');
var router = express.Router();
var timersModel = require('../data/timersData');

router.get('/', function (req, res) {
    var activeTimers = timersModel.timers.filter(function (timer) {
        return timer.isActive;
    });

    res.render('timers', {
        title: 'Timers',
        list: activeTimers
    });
});

module.exports = router;