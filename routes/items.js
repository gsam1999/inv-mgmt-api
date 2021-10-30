const express = require('express');
const bodyParser = require('body-parser');

const { Items } = require('../models/itemModel');
const { Branch } = require('../models/itemModel');
const { Category } = require('../models/itemModel');
const { Transaction } = require('../models/itemModel');
const User = require('../models/userModel');

const itemRouter = express.Router();
const verifyUser = require('../middleware/authorize');
const verifyAdmin = require('../middleware/admin');

itemRouter.use(bodyParser.json());

itemRouter.route('/')
    .get(verifyUser, (req, res, next) => {
        Items.find({ branch: { "$in": req.branches } })
            .populate('category')
            .populate('branch')
            .then((items) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(items);
            })
            .catch((err) => next(err))
    })
    .post(verifyUser, verifyAdmin, (req, res, next) => {
        let items = req.body.items;
        Items.insertMany(items)
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(item);
            })
            .catch(err => next(err))
    })

itemRouter.route('/category')
    .get(verifyUser, async (req, res, next) => {
        Category.find()
            .then((items) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                req.role != 'admin' && (items = items.filter(ele => ele.active))
                res.send(items);
            })
            .catch(err => next(err))
    })
    .post(verifyUser, verifyAdmin, async (req, res, next) => {
        if (req.body._id)
            Category.findByIdAndUpdate(req.body._id, { name: req.body.name, active: req.body.active })
                .then(async () => {
                    let items = await Category.find({});
                    res.send(items)
                })
                .catch(err => next(err))
        else
            Category.create({ name: req.body.name, active: true })
                .then(async () => {
                    let items = await Category.find({});
                    res.send(items)
                })
                .catch(err => next(err))
    })

itemRouter.route('/branch')
    .get(verifyUser, (req, res, next) => {
        User.findById(req.user)
            .populate('branches')
            .then((data) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(data.role != 'admin' ? data.branches.filter(branch => branch.active) : data.branches);
            })
            .catch(err => next(err))
    })
    .post(verifyUser, verifyAdmin, async (req, res, next) => {
        if (req.body._id)
            Branch.findByIdAndUpdate(req.body._id, { name: req.body.name, active: req.body.active })
                .then(async () => {
                    let items = await Branch.find({});
                    res.send(items)
                })
                .catch(err => next(err))
        else
            Branch.create({ name: req.body.name, active: true })
                .then(async () => {
                    let items = await Branch.find({});
                    await User.findOneAndUpdate({ name: 'admin' }, { branches: items.map(ele => ele._id) });
                    res.send(items)
                })
                .catch(err => next(err))
    })



// Transaction.aggregate([
//     {
//         $lookup: {
//             from: "items",
//             let: { item: "$item" },
//             pipeline: [{
//                 $match: {
//                     $expr: {
//                         $and: [
//                             { $eq: ['$_id', '$$item'] },
//                             { $regexMatch: { input: '$name', regex: ".*" + name + ".*" } },
//                             { $in: ['$category', { $map: { input: ['616e7143a35059da30524300'], in: { "$toObjectId": "$$this" } } }] }
//                         ]
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "category",
//                     foreignField: "_id",
//                     as: 'category'
//                 }
//             },
//             {
//                 $project: {
//                     "name": 1,
//                     "branch": 1,
//                     "category": { $first: "$category" }
//                 }
//             }
//             ],
//             as: "item"
//         }
//     },
//     {
//         $unwind: { path: "$item", preserveNullAndEmptyArrays: false },

//     }
// ]).then(data => console.log(data))


itemRouter.route('/Transactions')
    .get(verifyUser, (req, res, next) => {

        let filters = JSON.parse(req.query.filters);
        let query = {};
        sort = req.query.sort;

        if ((Object.keys(filters).length == 1) && filters.item) {
            filters.item && (query.item = filters.item);
            Transaction.find(query)
                .sort([[sort, req.query.order]])
                .skip(Number(req.query.size * req.query.page))
                .limit(Number(req.query.size))
                .populate({ path: 'item', populate: { path: 'category branch' } })
                .populate('user', 'username')
                .then(async (transactions) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.send({ count: await Transaction.count(query), transactions: transactions });
                })
                .catch(err => next(err))
        }
        else {
            filters.name && (query.name = {});
            let name = filters.name || ''
            let branch = filters.branches ? filters.branches.filter(ele => req.branches.indexOf(ele) > -1) : req.branches;
            let category = filters.category || '';
            let action = filters.action || '';
            let expire = filters.expire || false;
            let minDate = filters.minDate ? new Date(filters.minDate) : new Date(0);

            Transaction.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $expr: { $or: [{ $eq: [action, ''] }, { $eq: ['$action', action] }] }
                            },
                            {
                                $or: [{ $expr: { $eq: [expire, false] } }, { expiryDate: { $exists: expire } }]
                            },
                            {
                                $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: minDate } }]
                            }

                        ]
                    }
                },
                {
                    $lookup: {
                        from: "items",
                        let: { item: "$item" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$item'] },
                                            {
                                                $or: [
                                                    { $eq: [name, ''] },
                                                    { $regexMatch: { input: '$name', regex: ".*" + name + ".*" } }
                                                ]
                                            },
                                            {

                                                $in: ['$branch', { $map: { input: branch, in: { "$toObjectId": "$$this" } } }]

                                            },
                                            {
                                                $or: [
                                                    { $eq: [category, ''] },
                                                    { $in: ['$category', { $map: { input: category, in: { "$toObjectId": "$$this" } } }] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "branches",
                                    localField: "branch",
                                    foreignField: "_id",
                                    as: 'branch'
                                }
                            },
                            {
                                $lookup: {
                                    from: "categories",
                                    let: { category: "$category" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ["$$category", "$_id"]
                                                }
                                            }
                                        }
                                    ],
                                    as: 'category'
                                }
                            },
                            {
                                $project: {
                                    "name": 1,
                                    "branch": { $first: "$branch" },
                                    "category": { $first: "$category" },
                                    "units": 1,
                                    "imageLink": 1
                                }
                            }
                        ],
                        as: "item"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { user: "$user" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$user'] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    "username": 1
                                }
                            }
                        ],
                        as: 'user'
                    }
                },
                {
                    $project: {
                        "item": 1,
                        "action": 1,
                        "user": { $first: "$user" },
                        "createdAt": 1,
                        "quantity": 1,
                        "after": 1,
                        "expiryDate": 1
                    }
                },
                {
                    $unwind: { path: "$item", preserveNullAndEmptyArrays: false },
                },
                {
                    $sort: { [sort]: (req.query.order == "asc" ? 1 : -1) }
                },
                {
                    $facet: {
                        length: [{ "$count": "total" }],
                        data: [{ "$skip": Number(req.query.size * req.query.page) }, { "$limit": Number(req.query.size) }]
                    }
                }
            ]).then(data => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send({ count: data[0].length[0] ? data[0].length[0].total : 0, transactions: data[0].data });
            })
            //  .catch(err => next(err))
        }
    })
    .post(verifyUser, (req, res, next) => {
        req.body.user = req.user;
        Transaction.create(req.body).then(async (transaction) => {
            let item = await Items.findById(transaction.item).populate('category branch');

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
    .get(verifyUser, (req, res, next) => {
        Items.findById(req.params.itemid)
            .populate('category')
            .populate('branch')
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(item);
            })
            .catch(err => next(err))
    })
    .put(verifyUser, (req, res, next) => {
        let item = req.body;
        let update =
        {
            name: item.name,
            category: item.category,
            notes: item.notes,
            imageLink: item.imageLink,
            units: item.units,
            monthlyRequired: item.monthlyRequired
        }

        Items.findByIdAndUpdate(item._id, update)
            .then((item) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.send(item);
            })
            .catch(err => { console.log(err); next(err) })
    })


module.exports = itemRouter;