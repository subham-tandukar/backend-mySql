const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

const users = new mongoose.model("user", userSchema);

module.exports = users;
