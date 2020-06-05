var mongoose = require("mongoose");

const itemsSchema = {
  task: String,
  date: String,
  user: String,
  category: String,
};

module.exports = mongoose.model("Item", itemsSchema);
