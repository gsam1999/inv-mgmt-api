const jwt = require("jsonwebtoken");

const config = require('../config');

const verifyToken = (req, res, next) => {
    const authHeader = String(req.headers['authorization'] || '');
    let token = null;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7, authHeader.length);
        let b = token;
    }

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;
