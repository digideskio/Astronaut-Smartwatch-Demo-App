var express = require('express');
var router = express.Router();

var alertsModel = require('../data/alertData');

router.get('/', function (req, res, next) {
    res.render('alerts', {
        title: 'Alerts',
        list: alertsModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    alertsModel.alerts = req.body;
    res.sendStatus(200);
});

module.exports = router;