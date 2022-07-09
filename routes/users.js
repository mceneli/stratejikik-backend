const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
const Joi = require("joi");
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const jwt = require('jsonwebtoken');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  console.log("register:"+req.body.username);
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, salt);

  console.log("pass:"+password);

  const dbUser = new User({username,password});

  dbUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/login').post(async(req, res) => {
  console.log("login:"+req.body.username);
  const userLoggingIn = req.body;
 await User.findOne({ 'username': userLoggingIn.username })
 .then(dbUser => {
  if(!dbUser){
   return res.json({
    message:"Hatalı Kullanıcı Adı"
   })
  }
  console.log(userLoggingIn.password+" "+dbUser.password);
  var isCorrect=bcrypt.compareSync(userLoggingIn.password, dbUser.password);
   if(isCorrect){
    const payload = {
     id:dbUser._id,
     username:dbUser.username,
    }
    jwt.sign(
     payload,
     process.env.JWT_SECRET,
     {expiresIn:86400},
     (err,token)=>{
      if(err) {
               console.log("hata1")
               return res.json({message:err})}
       console.log("token "+token);
       return res.json({
       message:"Basarili",
       token:"Bearer "+token
      })
     })

   }else{
    console.log("yanlis sifre")
    return res.json({message:"Kullanıcı Adı/Şifre hatalı"})
   }
 })
});

module.exports = router;
