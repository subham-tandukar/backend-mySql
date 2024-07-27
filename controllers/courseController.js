const course = require("../models/courseSchema");
const fs = require("fs");
const cloudinary = require("../cloudinary");
const connectDB = require("../db/conn");

const db = connectDB();

// Function to check if the course table exists and create it if not
const ensureCourseTableExists = async () => {
  return new Promise((resolve, reject) => {
    db.query(
      `CREATE TABLE IF NOT EXISTS course (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255) NOT NULL,
        Price DECIMAL(10, 2) NOT NULL,
        NoOfSeat INT NOT NULL,
        Image_public_id VARCHAR(255) NOT NULL,
        Image_url VARCHAR(255) NOT NULL,
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

// ---- add course ----
exports.course = async (req, res) => {
  const { FLAG, CourseID, Title, Price, NoOfSeat, Image } = req.body;

  try {
    // Ensure the course table exists
    await ensureCourseTableExists();

    if (FLAG === "I") {
      if (!Title || !Price || !Image || !NoOfSeat) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }
      if (Price < 0 || NoOfSeat < 0) {
        return res.status(422).json({
          Message: "Must be more than zero",
        });
      }

      const courseImg = await cloudinary.uploader.upload(Image, {
        folder: "course",
      });

      const query = `
        INSERT INTO course (Title, Price, NoOfSeat, Image_public_id, Image_url)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(
        query,
        [Title, Price, NoOfSeat, courseImg.public_id, courseImg.secure_url],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            StatusCode: 200,
            Message: "success",
            Image: {
              public_id: courseImg.public_id,
              url: courseImg.secure_url,
            },
          });
        }
      );
    } else if (FLAG === "U") {
      if (!Title || !Price || !Image || !NoOfSeat) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }
      if (Price < 0 || NoOfSeat < 0) {
        return res.status(422).json({
          Message: "Must be more than zero",
        });
      }

      let urlRegex =
        /^(?:https?|ftp):\/\/[\w-]+(?:\.[\w-]+)+[\w.,@?^=%&amp;:/~+#-]*$/;

      const changeImage = urlRegex.test(Image);
      let courseImg;

      if (!changeImage) {
        db.query(
          "SELECT Image_public_id FROM course WHERE _id = ?",
          [CourseID],
          async (err, results) => {
            if (err || results.length === 0) {
              return res
                .status(500)
                .json({ error: "Course not found or database error" });
            }

            await cloudinary.uploader.destroy(results[0].Image_public_id);

            courseImg = await cloudinary.uploader.upload(Image, {
              folder: "course",
            });

            const updateQuery = `
            UPDATE course SET Title = ?, Price = ?, NoOfSeat = ?, Image_public_id = ?, Image_url = ?
            WHERE _id = ?
          `;
            db.query(
              updateQuery,
              [
                Title,
                Price,
                NoOfSeat,
                courseImg.public_id,
                courseImg.secure_url,
                CourseID,
              ],
              (err, result) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.status(200).json({ StatusCode: 200, Message: "success" });
              }
            );
          }
        );
      } else {
        const updateQuery = `
          UPDATE course SET Title = ?, Price = ?, NoOfSeat = ?
          WHERE _id = ?
        `;
        db.query(
          updateQuery,
          [Title, Price, NoOfSeat, CourseID],
          (err, result) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ StatusCode: 200, Message: "success" });
          }
        );
      }
    } else if (FLAG === "BOOKED") {
      const updateQuery = `
        UPDATE course SET NoOfSeat = NoOfSeat - 1
        WHERE _id = ?
      `;
      db.query(updateQuery, [CourseID], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ StatusCode: 200, Message: "success" });
      });
    } else if (FLAG === "SI") {
      const selectQuery = `
        SELECT * FROM course WHERE _id = ?
      `;
      db.query(selectQuery, [CourseID], (err, results) => {
        if (err || results.length === 0) {
          return res
            .status(500)
            .json({ error: "Course not found or database error" });
        }
        const formattedResults = results.map((course) => ({
          _id: course._id,
          Title: course.Title,
          Price: course.Price,
          NoOfSeat: course.NoOfSeat,
          Image: {
            public_id: course.Image_public_id,
            url: course.Image_url,
          },
        }));
        res.status(200).json({
          StatusCode: 200,
          Message: "success",
          Values: [formattedResults[0]],
        });
      });
    } else if (FLAG === "D") {
      db.query(
        "SELECT Image_public_id FROM course WHERE _id = ?",
        [CourseID],
        async (err, results) => {
          if (err || results.length === 0) {
            return res
              .status(500)
              .json({ error: "Course not found or database error" });
          }

          await cloudinary.uploader.destroy(results[0].Image_public_id);

          const deleteQuery = `
          DELETE FROM course WHERE _id = ?
        `;
          db.query(deleteQuery, [CourseID], (err, result) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ StatusCode: 200, Message: "success" });
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

// --- get course ---
exports.getCourse = async (req, res) => {
  try {
    const sql = "SELECT * FROM course ORDER BY createdAt DESC";

    db.query(sql, (err, results) => {
      if (err) return res.status(400).json({ StatusCode: 400, Message: err });

      const formattedResults = results.map((course) => ({
        _id: course._id,
        Title: course.Title,
        Price: course.Price,
        NoOfSeat: course.NoOfSeat,
        Image: {
          public_id: course.Image_public_id,
          url: course.Image_url,
        },
      }));

      res.status(200).json({
        StatusCode: 200,
        Message: "success",
        Values: formattedResults.length <= 0 ? null : formattedResults,
      });
    });
  } catch (error) {
    res.status(401).json({
      StatusCode: 400,
      Message: "course does not exist",
    });
  }
};
