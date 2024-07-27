const express = require("express");
const router = new express.Router();

const userControllers = require("../controllers/userController");
const loginControllers = require("../controllers/loginController");
const categoryControllers = require("../controllers/categoryController");
const blogControllers = require("../controllers/blogController");
const courseControllers = require("../controllers/courseController");
const bookingControllers = require("../controllers/bookingController");

// ==============================
router.post("/api/user", userControllers.user);
router.post("/api/login", loginControllers.login);
router.post("/api/category", categoryControllers.category);
router.post("/api/blog", blogControllers.blog);
router.get("/api/getBlog", blogControllers.getBlog);
router.post("/api/course", courseControllers.course);
router.get("/api/getCourse", courseControllers.getCourse);
router.post("/api/booking", bookingControllers.booking);
router.get("/api/getBooking", bookingControllers.getBooking);

// -------------------------------

module.exports = router;
