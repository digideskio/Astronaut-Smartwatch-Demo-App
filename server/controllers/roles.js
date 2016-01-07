var express = require('express');
var router = express.Router();

var roleModel = require('../data/roleData');

router.get('/', function (req, res, next) {
    res.render('roles', {
        title: 'Roles',
        list: roleModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    roleModel.roles = req.body;
    res.sendStatus(200);
});


module.exports = router;

