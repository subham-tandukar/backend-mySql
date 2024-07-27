const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../db/conn");
const JWT_SECRET = "Thisis@Secret";
const db = connectDB();

// Function to check if the user table exists and create it if not
const ensureUserTableExists = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS user (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Status VARCHAR(255) NOT NULL
      )`,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

// --- user ---
exports.user = async (req, res) => {
  const { Name, Password, FLAG } = req.body;
  let { Email } = req.body;

  try {
    // Ensure the user table exists
    await ensureUserTableExists();

    if (FLAG === "I") {
      if (!Name || !Email || !Password) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      // Convert email to lowercase
      Email = Email.toLowerCase();

      db.query(
        "SELECT * FROM user WHERE Email = ?",
        [Email],
        async (err, result) => {
          if (err)
            return res.status(400).json({ StatusCode: 400, Message: err });

          if (result.length > 0) {
            return res.status(422).json({
              Message: "This email already exists",
            });
          }

          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(Password, salt);

          const value = [Name, Email, secPass, "1"];
          db.query(
            "INSERT INTO user (Name, Email, Password, Status) VALUES (?)",
            [value],
            (err, result) => {
              if (err)
                return res.status(400).json({ StatusCode: 400, Message: err });

              const user = {
                id: result.insertId,
                name: Name,
                email: Email,
              };

              const data = {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
              };

              const authToken = jwt.sign(data, JWT_SECRET);

              res.status(201).json({
                StatusCode: 200,
                Message: "success",
                authToken,
              });
            }
          );
        }
      );
    } else if (FLAG === "S") {
      const sql = "SELECT * FROM user";
      db.query(sql, (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });
        return res.status(200).json({
          StatusCode: 200,
          Message: "success",
          Values: result.length <= 0 ? "No data" : result,
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
