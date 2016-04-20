var express = require('express');
var router = express.Router();
var _ = require('underscore');
var moment = require('moment');
var ws = require('../websocket');
var multer = require('multer');
var commsModel = require('../data/commsData');

function sortOutages() {
    commsModel.comms.outages.sort(function (l, r) {
        var a = moment(l.date + " " + l.startTime, "DD/MM/YYYY HH:mm");
        var b = moment(r.date + " " + r.startTime, "DD/MM/YYYY HH:mm");
        return b.isBefore(a);
    })
}

router.get('/', function (req, res, next) {
    res.render('comms', {
        title: 'Comms',
        id: 'comms',
        model: commsModel
    });
});

router.post('/', function (req, res) {
    commsModel.comms.sband.up1 = req.body[0].s_up1;
    commsModel.comms.sband.up2 = req.body[0].s_up2;
    commsModel.comms.sband.down1 = req.body[0].s_down1;
    commsModel.comms.sband.down2 = req.body[0].s_down2;
    commsModel.comms.kuband.up1 = req.body[1].ku_up1;
    commsModel.comms.kuband.up2 = req.body[1].ku_up2;
    commsModel.comms.kuband.down1 = req.body[1].ku_down1;
    commsModel.comms.kuband.down2 = req.body[1].ku_down2;
    commsModel.comms.iac = req.body[2].iac;
    commsModel.comms.oca = req.body[3].oca;

    ws.broadcast(JSON.stringify({
        event: 'comms',
        data: commsModel
    }));

    res.send({status: 'ok'});
});

router.post('/outages', function (req, res) {
    commsModel.comms.outages = req.body;
    ws.broadcast(JSON.stringify({
        event: 'comms',
        data: commsModel
    }));

    res.send({status: 'ok'});
});

router.post('/outages/add', function (req, res) {
    var newOutage = req.body;
    console.log("New outage: " + newOutage);
    if (commsModel.comms.outages && commsModel.comms.outages.length > 0) {
        newOutage.id = commsModel.comms.outages[commsModel.comms.outages.length - 1].id + 1;
    } else {
        newOutage.id = 0;
    }
    commsModel.comms.outages.push(newOutage);
    sortOutages();

    ws.broadcast(JSON.stringify({
        event: 'comms',
        data: commsModel
    }));

    res.location('/admin/comms');
    res.redirect('/admin/comms');
});

router.get('/outages/:id/delete', function (req, res) {
    var id = req.params.id;
    var outIndex = _.findIndex(commsModel.comms.outages, function (e) {
        return e.id == id
    });
    commsModel.comms.outages.splice(outIndex, 1);
    sortOutages();
    res.location('/admin/comms');
    res.redirect('/admin/comms');
});

var upload = multer({storage: multer.memoryStorage()});
router.post('/upload', upload.single('comms'), function (req, res) {
    if (req.file) {
        var data = req.file.buffer.toString();
        commsModel.comms = JSON.parse(data).comms;
    }
    ws.broadcast(JSON.stringify({
        event: 'upload'
    }));

    res.location('/admin/comms');
    res.redirect('/admin/comms');
});


module.exports = router;