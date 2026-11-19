
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    const admin = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    req.session.regenerate((err) => {
  if (err) {
    console.error("Session error:", err);

    return res.status(500).json({
      success: false,
      message: "Could not create login session."
    });
  }

  req.session.adminId = admin.id;

  res.json({
    success: true,
    message: "Login successful!"
  });
});

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated."
    });
  }

  res.json({
    success: true,
    adminId: req.session.adminId
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Could not log out."
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logged out successfully."
    });
  });
});


module.exports = router;
