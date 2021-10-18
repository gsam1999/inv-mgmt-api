const express = require('express');
const bodyParser = require('body-parser');

const { Items } = require('../models/itemModel');
const { Branch } = require('../models/itemModel');
const { Category } = require('../models/itemModel');
const { Transaction } = require('../models/itemModel');

const itemRouter = express.Router();
const auth = require('../middleware/authorize');

itemRouter.use(bodyParser.json());

itemRouter.route('/')
    .get((req, res, next) => {
        Items.find({})
            .populate('category')
            .populate('branch')
            .then((items) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(items);
            })
    })
    .post((req, res, next) => {
        let items = req.body.items;
        Items.insertMany(items).then((item) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        })
    })

itemRouter.route('/category')
    .get((req, res, next) => {
        Category.find({}).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })
    .post((req, res, next) => {
        Category.create({ name: req.body.name }).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })
    .delete((req, res, next) => {
        Category.deleteMany({ name: req.body.name }).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })

itemRouter.route('/branch')
    .get((req, res, next) => {
        Branch.find({}).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })
    .post((req, res, next) => {
        Branch.create({ name: req.body.name }).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })
    .delete((req, res, next) => {
        Branch.deleteMany({ name: req.body.name }).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })

itemRouter.route('/Transactions')
    .get((req, res, next) => {

        let validFilters = ['createdAt'];
        let filters = req.query.filters;

        Transaction.find({})
            .sort({ createdAt: req.query.order })
            .skip(Number(req.query.size * req.query.page))
            .limit(Number(req.query.size))
            .populate({ path: 'item', populate: { path: 'category branch' } })
            .then(async (transactions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send({ count: await Transaction.count({}), transactions: transactions });
            })
    })
    .post((req, res, next) => {
        Transaction.create(req.body).then(async (transaction) => {
            let item = await Items.findById(transaction.item).populate('category branch');
            if (transaction.action == 'Add')
                item.quantity += Number(transaction.quantity);
            else if (transaction.action == 'Remove' && item.quantity >= transaction.quantity)
                item.quantity -= Number(transaction.quantity);
            item.save().then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(item);
            })
        }).catch((err) => {
            err = new Error("item cannot be found");
            err.statusCode = 404;
            return next(err);
        })
    })

itemRouter.route('/:itemid')
    .get((req, res, next) => {
        Items.findById(req.params.itemid)
            .populate('category')
            .populate('branch')
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(item);
            })
    })
    .put((req, res, next) => {
        let item = req.body.item;
        Items.findByIdAndUpdate(item).then((item) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        })
    })
    .delete((req, res, next) => {
        Items.findByIdAndDelete(req.params.itemid).then((item) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        })
    })



module.exports = itemRouter;