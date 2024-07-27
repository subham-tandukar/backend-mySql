const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../db/conn");
const JWT_SECRET = "Thisis@Secret";
const db = connectDB();

// Function to check if the category table exists and create it if not
const ensureCategoryTableExists = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS category (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        Category VARCHAR(255) NOT NULL,
        Status VARCHAR(255) DEFAULT '1'
      )`,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

// ---- category ----
exports.category = async (req, res) => {
  const { FLAG, CategoryID, Category, Status } = req.body;

  try {
    // Ensure the category table exists
    await ensureCategoryTableExists();

    if (FLAG === "I") {
      if (!Category) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      db.query(
        "SELECT * FROM category WHERE Category = ?",
        [Category],
        (err, result) => {
          if (err) return res.status(400).json({ StatusCode: 400, Message: err });

          if (result.length > 0) {
            return res.status(422).json({
              Message: "This Category already exists",
            });
          }

          db.query(
            "INSERT INTO category (Category) VALUES (?)",
            [Category],
            (err, result) => {
              if (err)
                return res.status(400).json({ StatusCode: 400, Message: err });

              res.status(201).json({
                StatusCode: 200,
                Message: "success",
              });
            }
          );
        }
      );
    } else if (FLAG === "U") {
      if (!Category) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      db.query(
        "UPDATE category SET Category = ? WHERE _id = ?",
        [Category, CategoryID],
        (err, result) => {
          if (err) return res.status(400).json({ StatusCode: 400, Message: err });

          res.status(200).json({
            StatusCode: 200,
            Message: "success",
          });
        }
      );
    } else if (FLAG === "S") {
      let sql = "SELECT * FROM category";
      let params = [];
      if (Status && Status !== "-1") {
        sql += " WHERE Status = ?";
        params.push(Status);
      }
      sql += " ORDER BY _id DESC";

      db.query(sql, params, (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });

        res.status(200).json({
          StatusCode: 200,
          Message: "success",
          Values: result.length <= 0 ? "No data" : result,
        });
      });
    } else if (FLAG === "SI") {
      db.query(
        "SELECT * FROM category WHERE _id = ?",
        [CategoryID],
        (err, result) => {
          if (err) return res.status(400).json({ StatusCode: 400, Message: err });

          if (result.length > 0) {
            res.status(200).json({
              StatusCode: 200,
              Message: "success",
              Values: result,
            });
          } else {
            res.status(401).json({
              StatusCode: 400,
              Message: "Category not found",
            });
          }
        }
      );
    } else if (FLAG === "US") {
      db.query(
        "UPDATE category SET Status = ? WHERE _id = ?",
        [Status, CategoryID],
        (err, result) => {
          if (err) return res.status(400).json({ StatusCode: 400, Message: err });

          res.status(200).json({ StatusCode: 200, Message: "success" });
        }
      );
    } else if (FLAG === "D") {
      db.query(
        "DELETE FROM category WHERE _id = ?",
        [CategoryID],
        (err, result) => {
          if (err) return res.status(400).json({ StatusCode: 400, Message: err });

          res.status(200).json({
            StatusCode: 200,
            Message: "success",
          });
        }
      );
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
