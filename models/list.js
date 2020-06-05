var mongoose = require("mongoose");

const listSchema = {
  user: String,
  category: String,
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
};

module.exports = mongoose.model("List", listSchema);

/* const listSchema = {
    user: String,
    category: String,
    items: [itemsSchema],
  };
  
  const List = mongoose.model("List", listSchema); */
