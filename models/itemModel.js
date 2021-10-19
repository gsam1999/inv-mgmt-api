const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    active: { type: Boolean, required: true }
}, {
    timestamps: true
});

const branchSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    active: { type: Boolean, required: true }
}, {
    timestamps: true
});

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    imageLink: {
        type: String,
        required: true,
        maxLength: 200
    },
    units: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    monthlyRequired: {
        type: Number,
        required: true,
        min: 0
    },
    notes: {
        type: String,
        required: true,
        maxLength: 500
    }
}, {
    timestamps: true
});

const transactionSchema = new Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Items',
        required: true
    },
    action: {
        type: String,
        required: true,
    },
    before: {
        type: Number,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    after: {
        type: Number,
        min: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});


module.exports = {
    Items: mongoose.model('Items', itemSchema),
    Branch: mongoose.model('Branch', branchSchema),
    Category: mongoose.model('Category', categorySchema),
    Transaction: mongoose.model('Transaction', transactionSchema)
};

