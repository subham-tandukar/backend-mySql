const blog = require("../models/blogSchema");
const fs = require("fs");
const cloudinary = require("../cloudinary");
const connectDB = require("../db/conn");
const db = connectDB();

// Function to ensure tables exist
const ensureTablesExist = async () => {
  const blogTable = `
    CREATE TABLE IF NOT EXISTS blog (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      Title VARCHAR(255) NOT NULL,
      Description TEXT NOT NULL,
      Auther VARCHAR(255) NOT NULL,
      CategoryID INT,
      Image_public_id VARCHAR(255) NOT NULL,
      Image_url VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (CategoryID) REFERENCES category(_id)
    )`;

  await db.promise().query(blogTable);
};

// ---- add blog ----
exports.blog = async (req, res) => {
  const { FLAG, BlogID, Title, Description, Auther, CategoryID, Image } =
    req.body;

  try {
    // Ensure tables exist
    await ensureTablesExist();

    if (FLAG === "I") {
      if (!Title || !Description || !Image || !Auther || !CategoryID) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      const blogImg = await cloudinary.uploader.upload(Image, {
        folder: "blog",
      });

      const query = `INSERT INTO blog (Title, Description, Auther, CategoryID, Image_public_id, Image_url) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [
        Title,
        Description,
        Auther,
        CategoryID,
        blogImg.public_id,
        blogImg.secure_url,
      ];

      db.query(query, values, (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });
        res.status(201).json({
          StatusCode: 200,
          Message: "success",
          Image: { public_id: blogImg.public_id, url: blogImg.secure_url },
        });
      });
    } else if (FLAG === "U") {
      if (!Title || !Description || !Image || !Auther || !CategoryID) {
        return res.status(422).json({
          Message: "Please fill the required fields",
        });
      }

      let urlRegex =
        /^(?:https?|ftp):\/\/[\w-]+(?:\.[\w-]+)+[\w.,@?^=%&amp;:/~+#-]*$/;
      const changeImage = urlRegex.test(Image);

      let blogImg;
      let updateQuery;
      let updateValues;

      if (!changeImage) {
        db.query(
          `SELECT * FROM blog WHERE _id = ?`,
          [BlogID],
          async (err, results) => {
            if (err)
              return res.status(400).json({ StatusCode: 400, Message: err });

            const existingBlog = results[0];
            await cloudinary.uploader.destroy(existingBlog.Image_public_id);

            blogImg = await cloudinary.uploader.upload(Image, {
              folder: "blog",
            });
            updateQuery = `UPDATE blog SET Title = ?, Description = ?, Auther = ?, CategoryID = ?, Image_public_id = ?, Image_url = ? WHERE _id = ?`;
            updateValues = [
              Title,
              Description,
              Auther,
              CategoryID,
              blogImg.public_id,
              blogImg.secure_url,
              BlogID,
            ];
          }
        );
      } else {
        updateQuery = `UPDATE blog SET Title = ?, Description = ?, Auther = ?, CategoryID = ? WHERE _id = ?`;
        updateValues = [Title, Description, Auther, CategoryID, BlogID];
      }

      db.query(updateQuery, updateValues, (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });
        res.status(200).json({
          StatusCode: 200,
          Message: "success",
        });
      });
    } else if (FLAG === "SI") {
      const showBlogQuery = `SELECT * FROM blog WHERE _id = ?`;
      db.query(showBlogQuery, [BlogID], (err, results) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });

        const formattedResults = results.map((blog) => ({
          _id: blog._id,
          Title: blog.Title,
          Description: blog.Description,
          Auther: blog.Auther,
          CategoryID: blog.CategoryID,
          Image: {
            public_id: blog.Image_public_id,
            url: blog.Image_url,
          },
        }));

        if (results.length > 0) {
          res.status(200).json({
            StatusCode: 200,
            Message: "success",
            Values: [formattedResults[0]],
          });
        } else {
          res.status(401).json({
            StatusCode: 400,
            Message: "Blog not found",
          });
        }
      });
    } else if (FLAG === "D") {
      db.query(
        "SELECT Image_public_id FROM blog WHERE _id = ?",
        [BlogID],
        async (err, results) => {
          if (err || results.length === 0) {
            return res
              .status(500)
              .json({ error: "Blog not found or database error" });
          }

          await cloudinary.uploader.destroy(results[0].Image_public_id);

          const deleteQuery = `
          DELETE FROM blog WHERE _id = ?
        `;
          db.query(deleteQuery, [BlogID], (err, result) => {
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

// --- get blog ---
exports.getBlog = async (req, res) => {
  try {
    const CategoryID = req.query.CategoryID;

    let query;
    let values = [];

    if (CategoryID === "-1") {
      // Retrieve all blogs and their categories
      query = `
      SELECT b.*, c.Category as CategoryName
      FROM blog b
      LEFT JOIN category c ON b.CategoryID = c._id
      ORDER BY b.createdAt DESC
    `;
    } else if (CategoryID) {
      // Retrieve blogs filtered by CategoryID
      query = `
      SELECT b.*, c.Category as CategoryName
      FROM blog b
      LEFT JOIN category c ON b.CategoryID = c._id
      WHERE b.CategoryID = ?
      ORDER BY b.createdAt DESC
    `;
      values = [CategoryID];
    } else {
      // If no CategoryID is provided, handle this case (optional, not specified in the original code)
      return res.status(400).json({
        StatusCode: 400,
        Message: "CategoryID is required",
      });
    }

    db.query(query, values, (err, results) => {
      if (err) {
        return res.status(401).json({
          StatusCode: 400,
          Message: "Blog does not exist",
        });
      }

      const formattedResults = results.map((blog) => ({
        _id: blog._id,
        Title: blog.Title,
        Description: blog.Description,
        Auther: blog.Auther,
        CategoryID: blog.CategoryID,
        Image: {
          public_id: blog.Image_public_id,
          url: blog.Image_url,
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
      Message: "Blog does not exist",
    });
  }
};
