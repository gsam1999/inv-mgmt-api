const express = require('express');
const bodyParser = require('body-parser');
const cors = require('../cors')

const itemRouter = express.Router();

// let item = class {
//     name;
//     type;
//     measurement;
//     image;
//     quantity;
// };

var items = [];

itemRouter.use(bodyParser.json());

itemRouter.route('/')
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(items);
    })
    .post(cors.cors, (req, res, next) => {
        items.push(req.body)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.body);
    })

module.exports = itemRouter;