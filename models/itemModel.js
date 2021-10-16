const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    imageLink: {
        type: String,
        required: true
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
        required: true
    },
    transactions: [{
        Type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }]
}, {
    timestamps: true
});

var Item = mongoose.model('Item', itemSchema);

module.exports = Item;


const transactionSchema = new Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    action: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

var Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

