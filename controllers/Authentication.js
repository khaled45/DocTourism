var jwt = require('jsonwebtoken');


function VerifyToken(req, resp, next) {

    if (!req.headers.authorization) {
        resp.status(401).send('unauthorized request');
    }
    let token = req.headers.authorization.split(' ')[1];

    if (token === 'null' || token === 'undefined') {
        resp.status(401).send('unauthorized request');
    }

    let payload = jwt.verify(token, 'secretKey');

    if (!payload) {
        resp.status(401).send('unauthorized request');
    }
    debugger
    req.userID = payload.subject
    next();


}

module.exports = VerifyToken