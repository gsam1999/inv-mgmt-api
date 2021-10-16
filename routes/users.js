var express = require('express');
var userRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
var jwt = require('jsonwebtoken');
var config = require('../config');


userRouter.route('/register')
  .post(async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;
    const user = new User(body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.save().then((doc) => res.status(201).send(doc));
  })

userRouter.route('/login')
  .post(async (req, res, next) => {
    const body = req.body;
    const user = await User.findOne({ username: body.username });
    if (user) {
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (validPassword) {

        const token = jwt.sign(
          { user_id: user._id },
          config.TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );
        res.status(200).json({ message: "Valid password", token: token });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
  })

module.exports = userRouter;
