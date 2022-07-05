const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');


router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const newUser = new User({username,password});

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login/:username').get(async(req, res) => {
  //console.log("usname",req.params.username);
  //const username = req.body.username;
  //const password = req.body.password;

  //const newUser = new User({username,password});
 await User.findOne({ 'username': req.params.username })
 .then(user => res.json(user))
 .catch(err => res.status(400).json('Error: ' + err));

});

module.exports = router;
