require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes/router");
const connectDB = require("./db/conn");

var bodyParser = require("body-parser");
const { connection } = require("mongoose");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
const port = process.env.PORT || 8009;

app.use(cors());
app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  res.json("server start");
});

app.post("/api/khaltiPayment", async (req, res) => {
  const payload = req.body;
  const khaltiResponse = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    payload,
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_KEY}`,
      },
    }
  );
  if (khaltiResponse) {
    res.json({
      success: true,
      data: khaltiResponse?.data,
    });
  } else {
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
});

const start = async () => {
  try {
    const db = await connectDB();
    db.getConnection((err, connection) => {
      if (err) {
        console.log("MySQL connection error:", err);
      } else {
        console.log("Connected to MySql database successfully");
        connection.release();
      }
    });

    app.listen(port, () => {
      console.log(`server is started at port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
