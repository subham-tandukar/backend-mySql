const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    Fullname: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    PhoneNumber: {
      type: Number,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Course: {
      type: String,
      required: true,
    },
    IsPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const booking = new mongoose.model("booking", bookingSchema);

module.exports = booking;
