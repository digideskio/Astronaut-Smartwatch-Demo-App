var express = require('express');
var router = express.Router();

var commsModel = require('../data/commsData');

router.get('/', function (req, res, next) {
    res.render('comms', {
        title: 'Comms',
        model: commsModel
    });
});

router.post('/', function (req, res) {
    commsModel.comms.sband.up1 = req.body.s_up1;
    commsModel.comms.sband.up2 = req.body.s_up2;
    commsModel.comms.sband.down1 = req.body.s_down1;
    commsModel.comms.sband.down2 = req.body.s_down2;
    commsModel.comms.kuband.up1= req.body.ku_up1;
    commsModel.comms.kuband.up2 = req.body.ku_up2;
    commsModel.comms.kuband.down1 = req.body.ku_down1;
    commsModel.comms.kuband.down2 = req.body.ku_down2;
    commsModel.comms.iac = req.body.iac;
    commsModel.comms.oca = req.body.oca;
    res.sendStatus(200);
});

module.exports = router;