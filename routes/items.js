const express = require('express');
const bodyParser = require('body-parser');

const { Items } = require('../models/itemModel');
const { Branch } = require('../models/itemModel');
const { Category } = require('../models/itemModel');
const { Transaction } = require('../models/itemModel');
const User = require('../models/userModel');

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
    .get(async (req, res, next) => {
        Category.find({}).then((items) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.send(items);
        })
    })
    .post(async (req, res, next) => {
        if (req.body._id)
            Category.findByIdAndUpdate(req.body._id, { name: req.body.name, active: req.body.active }).then(async () => {
                let items = await Category.find({});
                res.send(items)
            })
        else
            Category.create({ name: req.body.name, active: true }).then(async () => {
                let items = await Category.find({});
                res.send(items)
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
    .post(async (req, res, next) => {
        if (req.body._id)
            Branch.findByIdAndUpdate(req.body._id, { name: req.body.name, active: req.body.active }).then(async () => {
                let items = await Branch.find({});
                await User.findOneAndUpdate({ name: 'admin' }, { branches: items.map(ele => ele._id) });
                res.send(items)
            })
        else
            Branch.create({ name: req.body.name, active: true }).then(async () => {
                let items = await Branch.find({});
                res.send(items)
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
            .populate('user', 'username')
            .then(async (transactions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send({ count: await Transaction.count({}), transactions: transactions });
            })
    })
    .post(auth, (req, res, next) => {
        req.body.user = req.user;
        Transaction.create(req.body).then(async (transaction) => {
            let item = await Items.findById(transaction.item);

            transaction.before = item.quantity;

            if (transaction.action == 'Add')
                item.quantity += Number(transaction.quantity);
            else if (transaction.action == 'Remove' && item.quantity >= transaction.quantity)
                item.quantity -= Number(transaction.quantity);
            transaction.after = item.quantity;

            item.save().then(async (item) => {
                await transaction.save()
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