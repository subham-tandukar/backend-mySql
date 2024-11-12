const connectDB = require("../db/conn");
const db = connectDB();

// Function to check if the faq table exists and create it if not
const ensureFaqTableExists = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS faq (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Question VARCHAR(255) NOT NULL,
        Answer VARCHAR(255),
        Status VARCHAR(255) DEFAULT '1',
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

// ---- faq ----
exports.faq = async (req, res) => {
  const { FLAG, FaqID, Name, Question, Answer, Status } = req.body;

  try {
    // Ensure the faq table exists
    await ensureFaqTableExists();

    if (FLAG === "I") {
      if (!Name || !Question) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      db.query(
        "SELECT * FROM faq WHERE Question = ?",
        [Question],
        (err, result) => {
          if (err)
            return res.status(400).json({ StatusCode: 400, Message: err });

          if (result.length > 0) {
            return res.status(422).json({
              Message: "This Question already exists",
            });
          }

          db.query(
            "INSERT INTO faq (Name, Question) VALUES (?, ?)",
            [Name, Question],
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
      if (!Answer) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      db.query(
        "UPDATE faq SET Answer = ? WHERE _id = ?",
        [Answer, FaqID],
        (err, result) => {
          if (err)
            return res.status(400).json({ StatusCode: 400, Message: err });

          res.status(200).json({
            StatusCode: 200,
            Message: "success",
          });
        }
      );
    } else if (FLAG === "SI") {
      db.query("SELECT * FROM faq WHERE _id = ?", [FaqID], (err, result) => {
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
            Message: "Faq not found",
          });
        }
      });
    } else if (FLAG === "US") {
      db.query(
        "UPDATE faq SET Status = ? WHERE _id = ?",
        [Status, FaqID],
        (err, result) => {
          if (err)
            return res.status(400).json({ StatusCode: 400, Message: err });

          res.status(200).json({ StatusCode: 200, Message: "success" });
        }
      );
    } else if (FLAG === "D") {
      db.query("DELETE FROM faq WHERE _id = ?", [FaqID], (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });

        res.status(200).json({
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

// --- get faq ---
exports.getFaq = async (req, res) => {
  try {
    const sql = "SELECT * FROM faq ORDER BY createdAt DESC";

    db.query(sql, (err, results) => {
      if (err) return res.status(400).json({ StatusCode: 400, Message: err });

      res.status(200).json({
        StatusCode: 200,
        Message: "success",
        Values: results.length <= 0 ? null : results,
      });
    });
  } catch (error) {
    res.status(401).json({
      StatusCode: 400,
      Message: "Faq does not exist",
    });
  }
};
