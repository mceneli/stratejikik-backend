const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require("bcryptjs");
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
  const password = req.body.password;

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
  //bcrypt.compare(userLoggingIn.password,dbUser.password)
  //.then(isCorrect => {
   if(true){
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
       token:token
      })
     })

   }else{
    console.log("yanlis sifre")
    return res.json({message:"Kullanıcı Adı/Şifre hatalı"})
   }
  //})
 })
});

function verifyJwt(req,res,next){
 const token = req.headers["x-access-token"]?.split(' ')[1]

 if(token){
  jwt.verify(token,"asd",(err,decoded) => {
   if(err) return res.json({
                  isLoggedIn:false,
                  message:"failed to auth"
                  })
   req.user={};
   req.user.id=decoded.id;
   req.user.username=decoded.username;
   next()
  })
 }else{
  res.json({message:"incorrect token",isLoggedIn:false})
 }
}

router.route('/getUsername').get((req, res) => {
  res.json({isLoggedIn:true,username:req.user.username})
});

module.exports = router;
