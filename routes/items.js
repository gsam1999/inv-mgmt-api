const express = require('express');
const bodyParser = require('body-parser');
const cors = require('../cors')

const itemRouter = express.Router();

// let item = class {
//     id
//     name;
//     type;
//     measurement;
//     image;
//     quantity;
// };

var items = [];
var transactions = [];

itemRouter.use(bodyParser.json());

itemRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(items);
    })
    .post(cors.cors, (req, res, next) => {
        req.body._id = new Date().getTime();
        items.push(req.body)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(req.body);
    })

itemRouter.route('/:itemid')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(items.find(ele => ele._id == req.params.itemid));
    })
    .post(cors.cors, (req, res, next) => {
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
    .post(cors.cors, (req, res, next) => {
        let item = items.find(ele => ele._id == req.body._id);
        if (item) {
            if (req.body.action == 'add')
                item.quantity += Number(req.body.quantity);
            else
                item.quantity -= Number(req.body.quantity);
            transactions.push({ itemid: req.body._id, data: req.body })
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

const transactionRouter = express.Router({ mergeParams: true });

itemRouter.use('/:itemid/transactions', transactionRouter);

transactionRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
    .get(cors.cors, (req, res, next) => {
        let item = items.find(ele => ele._id == req.params.itemid);
        if (item) {
            res.setHeader('Content-Type', 'application/json');
            res.send(transactions.filter(ele => ele.itemid = req.params.itemid));
        }
        else {
            err = new Error("item cannot be found");
            err.statusCode = 404;
            return next(err);
        }
    })

module.exports = itemRouter;