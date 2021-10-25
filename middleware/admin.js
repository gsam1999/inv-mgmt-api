const verifyAdmin = (req, res, next) => {

    if (req.role && req.role === 'admin')
        return next()
    else
        return res.status(401).send("Access Denied");
};

module.exports = verifyAdmin;
