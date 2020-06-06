const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/users.js");
const Item = require("./models/item.js");
const List = require("./models/list.js");

const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://gaurav:gaurav@comment-yjkq4.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

// custom variables

var usern = "";
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
  usern = "";
  console.log("logout");
  res.redirect("/");
});

app.get("/", function (req, res) {
  res.render("landing", { userName: usern });
});

app.get("/category", function (req, res) {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  console.log(today);
  if (usern === "") {
    res.redirect("/login");
  } else {
    if (went === "false") {
      date_search = "";
      category_search = "";
    }
    Item.find({ user: usern })
      .sort({ date: 1 })
      .then((posts) => {
        console.log(posts[0].date);
        res.render("list", {
          userName: usern,
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
  }
});

// post route

app.post("/category", function (req, res) {
  const category = req.body.newList;
  const task = req.body.task;
  const date = req.body.duedate;

  const item = new Item({
    task: task,
    date: date,
    user: usern,
    category: category,
  });
  if (usern === "") {
    res.redirect("/login");
  } else {
    item.save();
    res.redirect("/category");
  }
});

app.post("/search", function (req, res) {
  const category = req.body.newList;
  const date = req.body.date;

  if (usern === "") {
    res.redirect("/login");
  } else {
    category_search = category;
    date_search = date;
    went = "true";
    res.redirect("/category");
  }
});

app.post("/register", function (req, res) {
  const email = req.body.username;
  const password = req.body.password;

  const newUser = new User({
    email: email,
    password: password,
  });

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      usern = req.body.username;

      /*  var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + "-" + mm + "-" + dd;
      const defaultItems = new Item({
        task: "Add New Task",
        date: today,
        user: usern,
        category: "Personal",
      });
      defaultItems.save();
 */
      console.log(usern);
      res.redirect("/category");
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else if (foundUser) {
      if (foundUser.password === password) {
        usern = foundUser.email;
        res.redirect("/category");
      } else {
        res.redirect("login");
      }
    } else {
      res.redirect("/register");
    }
  });
});

/* app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    if (usern === "") {
      res.redirect("/login");
    }
  } else {
    List.findOne({ user: usern, name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
}); */

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("server started at 3000 port");
});
