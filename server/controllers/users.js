var express = require('express');
var router = express.Router();

var usersModel = require('../data/userData');

router.get('/', function (req, res, next) {
    res.render('users', {
        title: 'Users',
        list: usersModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    usersModel.users = req.body;
    res.sendStatus(200);
});


module.exports = router;

