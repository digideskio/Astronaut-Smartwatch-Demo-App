var express = require('express');
var router = express.Router();
var _ = require('underscore');
var moment = require('moment');

var alertsModel = require('../data/alertData');

function sortAlerts() {
    alertsModel.alerts.sort(function(l, r) {
        var a = moment(l.date + " " + l.time, "DD/MM/YYYY HH:mm:ss");
        var b = moment(r.date + " " + r.time, "DD/MM/YYYY HH:mm:ss");
        return b.isBefore(a);
    })
}

router.get('/', function (req, res, next) {
    res.render('alerts', {
        title: 'Alerts',
        list: alertsModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    alertsModel.alerts = req.body;
    sortAlerts();
    res.location('/admin/alerts');
    res.redirect('/admin/alerts');
});


router.get('/add', function (req, res) {
    res.render('alertAdd', {
        title: 'Add Alert'
    });
});

router.get('/:alertId/delete', function (req, res) {
    var alertId = req.params.alertId;
    var alertIndex = _.findIndex(alertsModel.alerts, function(e) { return e.id == alertId});
    alertsModel.alerts.splice(alertIndex, 1);
    sortAlerts();
    res.location('/admin/alerts');
    res.redirect('/admin/alerts');
});

router.post('/add', function (req, res) {
    var newAlert = req.body;
    newAlert.id = alertsModel.alerts[alertsModel.alerts.length - 1].id + 1;
    alertsModel.alerts.push(newAlert);
    sortAlerts();
    res.location('/admin/roles');
    res.redirect('/admin/roles');
});


module.exports = router;