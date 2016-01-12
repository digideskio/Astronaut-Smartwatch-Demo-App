var express = require('express');
var router = express.Router();
var _ = require('underscore');


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

router.get('/:roleName/delete', function (req, res) {
    var roleName = req.params.roleName;
    var roleIndex = _.findIndex(roleModel.roles, function(e) { return e.name == roleName});
    roleModel.roles.splice(roleIndex, 1);

    res.location('/admin/roles');
    res.redirect('/admin/roles');
});

router.post('/:roleName/add', function (req, res) {
    var roleName = req.params.roleName;
    roleModel.roles.push(roleName);
    res.location('/admin/roles');
    res.redirect('/admin/roles');
});


module.exports = router;

