const express = require('express');
const bodyParser = require('body-parser');

const itemRouter = express.Router();
const auth = require('../middleware/authorize');

// let item = class {
//     id
//     name;
//     type;
//     measurement;
//     image;
//     quantity;
//      notes;        
// };

var items = [];
var transactions = [];

itemRouter.use(bodyParser.json());

itemRouter.route('/')
    .get(auth, (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(items);
    })
    .post((req, res, next) => {
        req.body._id = new Date().getTime();
        items.push(req.body)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(req.body);
    })

itemRouter.route('/:itemid')
    .get((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        let item = items.find(ele => ele._id == req.params.itemid);
        item.transactions = transactions.filter(ele => ele._id = req.params.itemid);
        res.send(item);
    })
    .post((req, res, next) => {
        let item = items.find(ele => ele._id == req.params.itemid);
        if (item) {
            items[items.indexOf(item)] = req.body
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(req.body);
        }
        else {
            err = new Error("item cannot be found");
            err.statusCode = 404;
            return next(err);
        }
    })

itemRouter.route('/:itemid/UpdateQuantity')
    .post((req, res, next) => {
        let item = items.find(ele => ele._id == req.body._id);
        if (item) {
            if (req.body.action == 'Add')
                item.quantity += Number(req.body.quantity);
            else
                item.quantity -= Number(req.body.quantity);

            transactions.push(req.body)
            item.transactions = transactions.filter(ele => ele._id = item._id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        }
        else {
            err = new Error("item cannot be found");
            err.statusCode = 404;
            return next(err);
        }
    })

module.exports = itemRouter;