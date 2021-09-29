const cors = require('cors');

const whiteList = ['https://localhost:3443', 'http://localhost:3000', 'https://localhost:3443', 'https://gsam1999.github.io', "https://65.1.130.86"]

var corsOptionDelegate = (req, callback) => {
    var corsOptions;

    if (whiteList.indexOf(req.header('Origin')) > -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionDelegate);