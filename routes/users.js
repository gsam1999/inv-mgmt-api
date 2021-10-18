var express = require('express');
var userRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
var jwt = require('jsonwebtoken');
var config = require('../config');

const { Branch } = require('../models/itemModel');

async function verifyAdmin() {
  let branches = await Branch.find();
  if (!await User.exists({ username: 'admin', role: 'admin' })) {
    const user = new User({ username: 'admin', password: 'admin', role: 'admin', branches: branches.map(ele => ele._id) });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.save();
  }
}

verifyAdmin();

async function getHashedPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function getUserObject(body) {

  let validBranches = await Branch.find({});
  let userDetails = { username: body.username }

  if (body.password || body.role || (Array.isArray(body.branches) && body.branches.length != 0)) {
    body.password && (userDetails.password = await getHashedPassword(body.password));
    userDetails.role = body.role;
    userDetails.branches = body.branches.filter(ele => validBranches.find(br => br._id == ele));
    return userDetails;
  }
  else
    return false
}


userRouter.route('/')
  .get((req, res, next) => {
    User.find({})
      .populate('branches')
      .select('-password')
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send(users);
      })
  })

userRouter.route('/register')
  .post(async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    if (await User.exists({ username: body.username }))
      res.status(401).json({ error: "Username alread exists" });

    let userDetails = getUserObject(req.body);
    if (userDetails) {
      const user = new User();
      user.save().then((doc) => res.status(201).send(doc));
    }
    else {
      res.status(401).json({ error: "Invalid Details" });
    }
  })
  .put(async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;

    if (!await User.exists({ _id: body._id }))
      res.status(401).json({ error: "User does not exists" });

    let details = await getUserObject(req.body);

    if (details !== false)
      User.findByIdAndUpdate(body._id, details)
        .then((user) => res.status(200).send(user));
    else
      res.status(401).json({ error: "Invalid Details" });
  })

userRouter.route('/login')
  .post(async (req, res, next) => {
    const body = req.body;
    const user = await User.findOne({ username: body.username });
    if (user) {
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (validPassword) {
        const token = jwt.sign({ user_id: user._id }, config.TOKEN_KEY, { expiresIn: "48h" });
        res.status(200).json({ username: user.username, role: user.role, branches: user.branches, token: token });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
  })

module.exports = userRouter;
