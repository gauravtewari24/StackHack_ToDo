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
  if (usern === "") {
    res.redirect("/login");
  } else {
    /*    Item.find({ user: usern }, function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
          }
        });
        res.redirect("/");
      } else {
        console.log(usern);
        res.render("list", {
          userName: usern,
          listTitle: "Today",
          newListItems: foundItems,
        });
      }
    }); */
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
});

app.get("/category", function (req, res) {
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
});

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
    /* List.findOne({ user: usern, category: category }, function (
      err,
      foundList
    ) {
      if (err) {
        console.log(err);
      } else {
        item.save();
        res.redirect("/");
      }
    }); */
    item.save();
    res.redirect("/");
  }
});

/* app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ user: usern, name: customListName }, function (
    err,
    foundList
  ) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          user: usern,
          name: customListName,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {
          userName: foundList.user,
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
 */
// post route

/* app.post("/customlist", function (req, res) {
  const List = req.body.newList;
  res.redirect("/" + List);
}); */

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
      /*4 category initialised*/
      /* const lp = new List({
        user: usern,
        category: "Personal",
      });
      const lw = new List({
        user: usern,
        category: "Work",
      });
      const ls = new List({
        user: usern,
        category: "Shopping",
      });
      const lo = new List({
        user: usern,
        category: "Others",
      });
      lp.save();
      ls.save();
      lw.save();
      lo.save();*/
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + "/" + mm + "/" + dd;
      console.log(today);
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
    } else if (foundUser) {
      if (foundUser.password === password) {
        usern = foundUser.email;
        res.redirect("/");
      } else {
        alert("Invalid credentials");
      }
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
      /* item.save();
      res.redirect("/");
    } else {
      res.redirect("/Today " + usern);
    */
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
