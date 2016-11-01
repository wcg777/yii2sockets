'use strict';

function Routes() {
    // Dependencies are injected by a middleware into the request object in each route callback.
    // Available objects:
    //   - request.clientManager
    //   - request.clientManager.backend
    //   - request.clientManager.settings
}

Routes.prototype.checkServiceKey = function (request, response, next) {
    console.log('Check service key');
    if (request.clientManager.settings.serviceKey == request.header('NodejsServiceKey', '')) {
        next();
    } else {
        response.send({'error': 'Invalid service key.'});
    }
};

Routes.prototype.publishMessage = function (request, response) {
    var body = {body: request.body.body},
        channel = typeof request.body.channel !== "undefined" ? request.body.channel : false,
        userId = typeof request.body.userId !== "undefined" ? request.body.userId : false,
        sessionId = typeof request.body.sessionId !== "undefined" ? request.body.sessionId : false,
        socketId = typeof request.body.socketId !== "undefined" ? request.body.socketId : false,
        broadcast = typeof request.body.broadcast !== "undefined" ? request.body.broadcast : false;
    if(typeof request.body.callback !== "undefined") body.callback = request.body.callback;
    var sentCount = 0, resp = {success: false, sent: 0};
    if(userId === false && sessionId === false && socketId === false && channel === false && broadcast === false) {
        resp.error = 'Undefined recipient (sessionId|socketId|userId|channel|broadcast)';
    //Send to User ID
    } else if(userId !== false) {
        sentCount = request.clientManager.publishMessageToUser(userId, body);
    //Send to Session ID
    } else if(sessionId !== false) {
        sentCount = request.clientManager.publishMessageToSid(sessionId, body);
    //Send to Socket ID
    } else if(socketId !== false) {
        sentCount = request.clientManager.publishMessageToClient(socketId, body) ? 1 : 0;
    //Send to channel
    } else if(channel !== false) {
        sentCount = request.clientManager.publishMessageToChannel(channel, body);
    //Send to all users
    } else if(broadcast !== false && broadcast) {
        sentCount = request.clientManager.publishMessageBroadcast(body);
    }
    resp.success = typeof resp.error === "undefined";
    resp.sent = sentCount;

    response.json(resp);
};

Routes.prototype.addChannelToUser = function (request, response) {

    response.json({success: true});
};

Routes.prototype.updateUserData = function (request, response) {
    var sid = request.body.sid;

    response.json({success: true});
};

Routes.prototype.send404 = function (request, response) {
    response.status(404).send('Not Found.');
};

module.exports = Routes;