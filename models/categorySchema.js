const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  Category: {
    type: String,
    required: true,
  },

  Status: {
    type: String,
    default: "1",
  },
});

const category = new mongoose.model("category", categorySchema);

module.exports = category;
