const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const urlencodedParser = bodyParser.urlencoded({extended:false});

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.post("/register", async (req,res) => {
 const user = req.body;

 const takenUsername = await User.findOne({username:user.username});

 if(takenUsername){
  res.json({message:"Kullanıcı adı alınmış"})
 }else{
  user.password = await bcrypt.hash(req.body.password,10);

  const dbUser = new User({
   username:user.username.toLowerCase(),
   password:user.password
  })

  dbUser.save();
  res.json({message:"Başarılı"});
 }
})

app.post("/login", (req,res) => {
 const userLoggingIn = req.body;

 User.findOne({username:userLoggingIn.username})
.then(dbUser => {
 if(!dbUser){
  return res.json({message:"Hatalı kullanıcı adı/şifre"});
 }
 bcrypt.compare(userLoggingIn.password, dbUser.password)
 .then(isCorrect => {
  if(isCorrect){
   const payload = {
    id:dbUser._id,
    username:dbUser.username,
   }
   jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {expiresIn:86400},
    (err, token) => {
     if(err) return res.json({message:err});
     return res.json({message:"Başarılı",token:"bearer:"+token});
     }
    )
   }else{
    return res.json({message:"Hatalı kullanıcı adı/şifre"});
   }
  })
 })
})

function verifyJWT(req,res,next){
 const token=req.headers["x-access-token"]?.split(' ')[1];
  if(token){
   jwt.verify(token,process.env.PASSPORTSECRET,(err,decoded) => {
    if(err) return res.json({isLoggedIn:false,message:"Failed to authenticate"});
    req.user={};
    req.user.id=decoded.id;
    req.username=decoded.username;
    next();
   });
  }else{return res.json({message:"Incorrect token given",isLoggedIn:false})
 }
}

app.get("/getUsername",verifyJWT,(req,res) => {
 res.json({isLoggedIn:true,username:req.user.username});
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

