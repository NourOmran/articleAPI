//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10 ; 

const app = express();

//test git 

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB");







const articleSchema = { 
    title: String,
    content: String
};

const userSchema = new mongoose.Schema({ 
    email: String,
    password: String
});


//userSchema.plugin(encrypt , {secret : process.env.SECRET ,encryptedFields:['password']}); 

const users  = mongoose.model("users",userSchema);
const articles = mongoose.model("articels",articleSchema); 

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await users.findOne({email: email});
    if (user ) {
        bcrypt.compare(password , user.password, function(err, result) {
            if (result === true){
                res.send('Login successful');
            }
        });
       
    } else {
        res.status(401).send('Invalid email or password');
    }
});

app.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new users({
        email,
        password: hashedPassword,
      });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
app.route("/register").get(function(req ,res ){
    users.find().then((users) => {
        console.log(users);
      
       })
})



app.route("/articels")

.get(function(req ,res ){
    articles.find().then((articles) => {
        console.log(articles);
      
       })
})

.post(function(req ,res ){
    console.log(req.body.title)
    console.log(req.body.content)
     
    const newArticle  = new articles (
        {
            title : req.body.title,
            content : req.body.content
        }
    );

    newArticle.save();
    res.send("new article add ");


}); 




app.listen(3000, function() {
  console.log("Server started on port 3000");
});