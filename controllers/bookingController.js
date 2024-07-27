const connectDB = require("../db/conn");
const db = connectDB();

// Function to check if the booking table exists and create it if not
const ensureBookingTableExists = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS booking (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        Fullname VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        PhoneNumber BIGINT NOT NULL,
        Address VARCHAR(255) NOT NULL,
        Course VARCHAR(255) NOT NULL,
        IsPaid BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

// ---- add booking ----
exports.booking = async (req, res) => {
  const {
    FLAG,
    BookingID,
    Fullname,
    Email,
    PhoneNumber,
    Address,
    Course,
    IsPaid,
  } = req.body;

  try {
    // Ensure the booking table exists
    await ensureBookingTableExists();

    if (FLAG === "I") {
      if (!Fullname || !Email || !Address || !PhoneNumber || !Course) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      const sql = `INSERT INTO booking (Fullname, Email, PhoneNumber, Address, Course, IsPaid) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [
        Fullname,
        Email,
        PhoneNumber,
        Address,
        Course,
        IsPaid || false,
      ];

      db.query(sql, values, (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });

        res.status(201).json({
          StatusCode: 200,
          Message: "success",
        });
      });
    } else {
      res.status(400).json({ StatusCode: 400, Message: "Invalid flag" });
    }
  } catch (error) {
    res.status(401).json({
      StatusCode: 400,
      Message: error,
    });
  }
};

// --- get booking ---
exports.getBooking = async (req, res) => {
  try {
    const sql = `SELECT * FROM booking ORDER BY createdAt DESC`;
    db.query(sql, (err, result) => {
      if (err) return res.status(400).json({ StatusCode: 400, Message: err });

      res.status(200).json({
        StatusCode: 200,
        Message: "success",
        Values: result.length <= 0 ? null : result,
      });
    });
  } catch (error) {
    res.status(401).json({
      StatusCode: 400,
      Message: "no booking exist",
    });
  }
};
