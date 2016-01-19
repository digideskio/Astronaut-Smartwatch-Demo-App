var express = require('express');
var router = express.Router();
var _ = require('underscore');


var commsModel = require('../data/commsData');

router.get('/', function (req, res, next) {
    res.render('comms', {
        title: 'Comms',
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
    res.sendStatus(200);
});

router.post('/outages/add', function (req, res) {
    var newOutage = req.body;
    console.log("New outage: " + newOutage);
    if(commsModel.outages && commsModel.outages.length > 0) {
        newOutage.id = commsModel.outages[commsModel.outages.length - 1].id + 1;
    } else {
        newOutage.id = 0;
    }
    commsModel.outages.push(newOutage);
    res.location('/admin/comms');
    res.redirect('/admin/comms');
});

router.get('/outages/:id/delete', function (req, res) {
    var id = req.params.id;
    var outIndex = _.findIndex(commsModel.outages, function (e) {
        return e.id == id
    });
    commsModel.outages.splice(outIndex, 1);

    res.location('/admin/comms');
    res.redirect('/admin/comms');
});

module.exports = router;