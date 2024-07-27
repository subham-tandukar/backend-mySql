const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("../db/conn");
const JWT_SECRET = "Thisis@Secret";
const db = connectDB();

// --- login ---
exports.login = async (req, res) => {
  const { Email, Password } = req.body;

  try {
    // Convert email to lowercase
    const email = Email.toLowerCase();

    // Check if user exists
    db.query(
      "SELECT * FROM user WHERE Email = ?",
      [email],
      async (err, result) => {
        if (err) return res.status(400).json({ StatusCode: 400, Message: err });

        if (result.length === 0) {
          return res.status(401).json({
            Message: "User doesn't exist",
          });
        }

        const user = result[0];

        // Compare passwords
        const passwordCompare = await bcrypt.compare(Password, user.Password);
        if (!passwordCompare) {
          return res.status(401).json({
            Message: "Password doesn't match",
          });
        }

        const data = {
          user: {
            id: user._id,
            name: user.Name,
            email: user.Email,
          },
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        if (user.Status === "1") {
          res.status(200).json({
            StatusCode: 200,
            Message: "success",
            Token: authToken,
            Login: [
              {
                Name: user.Name,
                Email: user.Email,
                UserID: user._id, // Adjusted to match MySQL column naming
              },
            ],
          });
        } else {
          res.status(401).json({
            StatusCode: 400,
            Message: "Please verify your email first",
          });
        }
      }
    );
  } catch (err) {
    res.status(401).json({
      StatusCode: 400,
      Message: err,
    });
  }
};
