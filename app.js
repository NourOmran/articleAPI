//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
const session = require("express-session"); 
const passport = require("passport"); 
const passportLocalMongoose = require("passport-local-mongoose"); 

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret : "my secret",
  resave : false , 
  saveUninitialized : false 
}));

app.use(passport.initialize()); 
app.use(passport.session()); 


mongoose.connect("mongodb://localhost:27017/wikiDB");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  body: String,
  date: { type: Date, default: Date.now },
  meta: {
    like: Number,
    dislike: Number,  
    favs: Number
  }
});

const userSchema = new mongoose.Schema({ 
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const users  = new mongoose.model("users",userSchema);
const articles = mongoose.model("articels",blogSchema); 

passport.use(users.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(users.serializeUser());
passport.deserializeUser(users.deserializeUser());


app.post('/login', function(req,res){
      const user = new users({
        username : req.body.username , 
        password : req.body.password
      })
      req.login(user , function(err){
        if(err){
          console.log(err);
        }
        else { 
          passport.authenticate("local")(req,res,function(){
            res.send("welcome back ")
          })
        }
      })
});

app.post('/register', async(req , res )=>{
    // check if the passport already exist
    const { username, password } = req.body;
    const existingUser = await users.findOne({username});
    if (existingUser) {
      return res.status(400).json({ message: 'user already registered' });
    }
    // register new user 
   users.register({username : req.body.username} , req.body.password , function(err ,user ){
    if (err){
      console.log(err)
      res.redirect('/register')
    }
    else { 
      passport.authenticate("local")(req,res ,function(){
          res.send('new user'); 
      })
    }
   }) 
      
});

app.route("/articels")

.get(function(req ,res ){
    if (req.isAuthenticated()){
      console.log(req.body);
      res.send("we'r logged in ");
    }
    else{ 
      res.redirect("/login");
    }
})

.post(function(req ,res ){
    if (req.isAuthenticated()){
      console.log(req.user);
     
      const newArticle  = new articles (
        {
            title : req.body.title,
            author : req.body.author,
            body : req.body.body,
            date : req.body.Date,
            like: req.body.like,
            dislike : req.body.dislike
        }
    );

    newArticle.save();
    res.send("new article add ");
    }
    else{
      console.log(("log in first "));
      //res.redirect("/");
    }
    


})
.patch(function(req,res){

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});