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

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

// custom variables

var usern = "";

// get rout

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
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + "-" + mm + "-" + dd;
  if (usern === "") {
    res.redirect("/login");
  } else {
    Item.find({ user: usern })
      .sort({ date: 1 })
      .then((posts) => {
        res.render("list", {
          userName: usern,
          listTitle: "All Tasks",
          newListItems: posts,
          today: today,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.get("/landing", function (req, res) {
  res.render("landing", { userName: usern });
});

/* app.get("/category", function (req, res) {
  if (usern === "") {
    res.redirect("/login");
  } else {
    Item.find({ user: usern })
      .sort({ date: 1 })
      .then((posts) => {
        res.render("list", {
          userName: usern,
          listTitle: "All Tasks",
          newListItems: posts,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}); */

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
    res.redirect("/");
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

      var today = new Date();
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

      console.log(usern);
      res.redirect("/");
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
        res.redirect("/");
      } else {
        res.redirect("login");
      }
    } else {
      res.redirect("/register");
    }
  });
});

app.post("/", function (req, res) {
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
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "All Tasks") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { user: usern, name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
