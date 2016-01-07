var app = require('express')();
var debug = require('debug')('server:websocket');
var http = require("http");
var WebSocketServer = require("ws").Server;
var port = 5000;

var server = http.createServer(app);
server.listen(port);

var wss = new WebSocketServer({server: server});
wss.on("connection", function (ws) {
    debug("new client connected");
    ws.on("message", function (data, flags) {
        debug("got a message [" + data + "]");
    });

    ws.on("close", function () {
        debug("client disconnected");
    });
});
debug("server created");

module.exports = wss;