const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Auther: {
      type: String,
      required: true,
    },
    CategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    Image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    Comments: [
      {
        Name: String,
        Email: String,
        Cmt: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);

const blogs = new mongoose.model("blog", blogSchema);

module.exports = blogs;
