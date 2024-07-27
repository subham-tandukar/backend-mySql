const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Price: {
      type: Number,
      required: true,
    },
    NoOfSeat: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

const courses = new mongoose.model("course", courseSchema);

module.exports = courses;
