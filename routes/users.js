const router = require('express').Router();
let User = require('../models/user.model');
const bcrypt = require("bcryptjs");
const Joi = require("joi");

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

router.route('/login').post(async(req, res) => {
 console.log("login metodu");
 try{
  const { error } = validate(req.body);
  if (error)
   return res.status(400).send({ message: error.details[0].message });

 const user = await User.findOne({ username: req.body.username });
  if (!user)
   return res.status(401).send({ message: "Invalid Email or Password" }); 

 const validPassword = await bcrypt.compare(
  req.body.password,
  user.password
 );
 if (!validPassword)
  return res.status(401).send({ message: "Invalid Email or Password" });

 const token = user.generateAuthToken();
  res.status(200).send({ data: token, message: "logged in successfully" });
 }catch (error) {
  res.status(500).send({ message: "Internal Server Error" });
 }
});

const validate = (data) => {
	const schema = Joi.object({
		username: Joi.string().username().required().label("Username"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = router;
