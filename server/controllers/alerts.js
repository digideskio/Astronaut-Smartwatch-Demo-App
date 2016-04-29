var express = require('express');
var router = express.Router();
var _ = require('underscore');
var moment = require('moment');
var ws = require('../websocket');
var multer = require('multer');
var alertsModel = require('../data/alertData');

function sortAlerts() {
    alertsModel.alerts.sort(function (l, r) {
        var a = moment(l.date + " " + l.time, "MM/DD/YYYY HH:mm:ss");
        var b = moment(r.date + " " + r.time, "MM/DD/YYYY HH:mm:ss");
        return b.isBefore(a);
    })
}

router.get('/', function (req, res, next) {
    res.render('alerts', {
        title: 'Alerts',
        id: 'alerts',
        list: alertsModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    alertsModel.alerts = req.body;
    sortAlerts();

    ws.broadcast(JSON.stringify({
        event: 'upload'
    }));

    res.send({status: 'ok'});
});


router.get('/add', function (req, res) {
    res.render('alertAdd', {
        title: 'Add Alert',
        id: 'alerts'
    });
});

router.get('/:alertId/delete', function (req, res) {
    var alertId = req.params.alertId;

    var alertIndex = _.findIndex(alertsModel.alerts, function (e) {
        return e.id == alertId
    });
    alertsModel.alerts.splice(alertIndex, 1);
    sortAlerts();

    ws.broadcast(JSON.stringify({
        event: 'delete'
    }));

    res.location('/admin/alerts');
    res.redirect('/admin/alerts');
});

router.post('/add', function (req, res) {
    var newAlert = req.body;
    newAlert.controlNotification = true;

    if (alertsModel.alerts.length == 0) {
        newAlert.id = 0;
    } else {
        newAlert.id = alertsModel.alerts[alertsModel.alerts.length - 1].id + 1;
    }

    newAlert.ack = [];

    alertsModel.alerts.push(newAlert);
    sortAlerts();

    ws.broadcast(JSON.stringify({
        event: 'alert',
        data: newAlert
    }));

    res.location('/admin/alerts');
    res.redirect('/admin/alerts');
});

var upload = multer({storage: multer.memoryStorage()});
router.post('/upload', upload.single('alerts'), function (req, res) {
    if (req.file) {
        var data = req.file.buffer.toString();
        var alrts = JSON.parse(data).alerts;
        for (var i = 0; i < alrts.length; i++) {
            alrts[i].ack = [];
        }
        alertsModel.alerts = alertsModel.alerts.concat();
    }
    ws.broadcast(JSON.stringify({
        event: 'upload'
    }));

    res.location('/admin/alerts');
    res.redirect('/admin/alerts');
});


module.exports = router;