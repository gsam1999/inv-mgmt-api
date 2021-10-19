const jwt = require("jsonwebtoken");

const config = require('../config');

const verifyToken = (req, res, next) => {
    const authHeader = String(req.headers['authorization'] || '');
    let token = null;
    if (authHeader.startsWith('Bearer '))
        token = authHeader.substring(7, authHeader.length);

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded.user_id;
        req.role = decoded.role
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;

// const verifyAdmin = (req, res, next) => {

//     if (req.role && req.role === 'admin')
//         return next()
//     else
//         return res.status(401).send("Access Denied");
// };

// module.exports = verifyAdmin;
