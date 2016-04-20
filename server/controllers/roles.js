var express = require('express');
var router = express.Router();
var _ = require('underscore');
var multer = require('multer');
var roleModel = require('../data/roleData');
var ws = require('../websocket');

router.get('/', function (req, res, next) {
    res.render('roles', {
        title: 'Roles',
        id: 'roles',
        list: roleModel
    });
});

router.post('/', function (req, res) {
    console.log("%O", req.body);
    roleModel.roles = req.body;

    ws.broadcast(JSON.stringify({
        event: 'roles'
    }));

    res.send({ status: 'ok'});
});

router.get('/:roleName/delete', function (req, res) {
    var roleName = req.params.roleName;
    var roleIndex = _.findIndex(roleModel.roles, function(e) { return e.name == roleName});
    roleModel.roles.splice(roleIndex, 1);

    ws.broadcast(JSON.stringify({
        event: 'roles'
    }));

    res.location('/admin/roles');
    res.redirect('/admin/roles');
});

router.post('/add', function (req, res) {
    roleModel.roles.push(req.body);

    ws.broadcast(JSON.stringify({
        event: 'roles'
    }));

    res.location('/admin/roles');
    res.redirect('/admin/roles');
});

var upload = multer({storage: multer.memoryStorage()});
router.post('/upload', upload.single('roles'), function (req, res) {
    if (req.file) {
        var data = req.file.buffer.toString();
        roleModel.roles = roleModel.roles.concat(JSON.parse(data).roles);
    }
    ws.broadcast(JSON.stringify({
        event: 'upload'
    }));

    res.location('/admin/roles');
    res.redirect('/admin/roles');
});

module.exports = router;

