var express = require('express');
var router = express.Router();
var _ = require('underscore');

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

router.get('/:userName/delete', function (req, res) {
    var userName = req.params.userName;
    var userIndex = _.findIndex(usersModel.users, function (e) {
        return e.name == userName
    });
    usersModel.users.splice(userIndex, 1);

    res.location('/admin/users');
    res.redirect('/admin/users');
});

router.post('/add', function (req, res) {
    usersModel.users.push(req.body);
    res.location('/admin/users');
    res.redirect('/admin/users');
});



module.exports = router;

