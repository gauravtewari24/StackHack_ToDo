var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    User = require("./models/users.js"),
    Item = require("./models/item.js"),
    List = require("./models/list.js"),
    passport=require("passport"),
    LocalStrategy=require("passport-local");
    //User = require("./models/user.js");

const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://gaurav:gaurav@comment-yjkq4.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

app.use(require("express-session")({
  secret: "Once again the monsoon arrives!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  //res.locals.error= req.flash("error");
  //res.locals.success=req.flash("success");
  next();
})


// custom variables

//var usern = "gaurav";
var date_search = "";
var category_search = "";
var went = "false";

// get route

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/lg", function (req, res) {
  req.logout();
  //console.log("logout");
  res.redirect("/");
});

app.get("/", function (req, res) {
  res.render("landing");
});

app.get("/category",isLoggedIn, function (req, res) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  console.log(today);
  
    if (went === "false") {
      date_search = "";
      category_search = "";
    }
    Item.find({ user: req.user.username })
      .sort({ date: 1 })
      .then((posts) => {
        res.render("list", {
          
          listTitle: "All Tasks",
          newListItems: posts,
          today: today,
          date_s: date_search,
          category_s: category_search,
        });
        went = "false";
      })
      .catch((err) => {
        console.log(err);
      });
  //}
});

// post route

app.post("/category",isLoggedIn, function (req, res) {
  const category = req.body.newList;
  const task = req.body.task;
  const date = req.body.duedate;

  const item = new Item({
    task: task,
    date: date,
    user: req.user.username,
    category: category,
  });
  
    item.save();
    res.redirect("/category");
  
});

app.post("/search",isLoggedIn, function (req, res) {
  const category = req.body.newList;
  const date = req.body.date;

    category_search = category;
    date_search = date;
    went = "true";
    res.redirect("/category");
});

app.post("/register", function (req, res) {
  var newUser = new User({username: req.body.username});
  //const email = req.body.username;
  User.register(newUser, req.body.password, function(err, user){
    if(err){
        //req.flash("error", err.message);
        console.log(err);
        return res.redirect("/register");
      }
    passport.authenticate("local")(req, res, function(){
     
        //req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/category");
    });
});
  
});

app.post("/login", passport.authenticate("local",
{
    successRedirect:"/category",
    failureRedirect:"/login"
        }),function (req, res) {
  const usern = req.body.username;
  
});



app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "All Tasks") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/category");
      }
    });
  } else {
    res.redirect("/category");
  }
});


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  //req.flash("error","You need to be Logged In!")
  res.redirect("/login");
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("server started at 3000 port");
});
