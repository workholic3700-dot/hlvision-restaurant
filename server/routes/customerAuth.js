
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// CUSTOMER REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required."
      });
    }

    // 2. Normalize input
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;

    // 3. Validate input lengths
    if (cleanName.length < 2 || cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Full name must be between 2 and 150 characters."
      });
    }

    if (cleanEmail.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    if (cleanPhone && cleanPhone.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Phone number is too long."
      });
    }

    // 4. Check whether email already exists
    const existingCustomer = await pool.query(
      "SELECT id FROM customers WHERE email = $1",
      [cleanEmail]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // 5. Hash password before saving
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Save customer in database
    const result = await pool.query(
      `INSERT INTO customers (
        full_name,
        email,
        phone,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, phone, created_at`,
      [cleanName, cleanEmail, cleanPhone, passwordHash]
    );

    // 7. Return successful response
    res.status(201).json({
      success: true,
      message: "Customer account created successfully!",
      customer: result.rows[0]
    });

  } catch (error) {
    console.error("Customer registration error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create customer account."
    });
  }
});

// CUSTOMER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    // 2. Normalize email
    const cleanEmail = email.trim().toLowerCase();

    // 3. Find customer by email
    const result = await pool.query(
      `SELECT id, full_name, email, phone, password_hash
       FROM customers
       WHERE email = $1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const customer = result.rows[0];

    // 4. Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 5. Preserve any existing admin session information
    const existingAdminId = req.session.adminId;

    // 6. Create a fresh session
    req.session.regenerate((err) => {
      if (err) {
        console.error("Customer session error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not create customer session."
        });
      }

      // Keep admin authentication independent
      if (existingAdminId) {
        req.session.adminId = existingAdminId;
      }

      // Set customer authentication
      req.session.customerId = customer.id;

      // 7. Save session
      req.session.save((saveError) => {
        if (saveError) {
          console.error("Customer session save error:", saveError);

          return res.status(500).json({
            success: false,
            message: "Could not save customer session."
          });
        }

        res.json({
          success: true,
          message: "Customer login successful!",
          customer: {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone
          }
        });
      });
    });

  } catch (error) {
    console.error("Customer login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during customer login."
    });
  }
});


 // CHECK CUSTOMER SESSION
router.get("/me", async (req, res) => {
  try {
    if (!req.session.customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer not authenticated."
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, phone, created_at
       FROM customers
       WHERE id = $1`,
      [req.session.customerId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Customer account not found."
      });
    }

    res.json({
      success: true,
      customer: result.rows[0]
    });

  } catch (error) {
    console.error("Customer session check error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify customer session."
    });
  }
});


 // CUSTOMER LOGOUT
router.post("/logout", (req, res) => {
  if (!req.session.customerId) {
    return res.status(401).json({
      success: false,
      message: "Customer is not logged in."
    });
  }

  // Preserve an independently authenticated admin session
  const existingAdminId = req.session.adminId;

  if (existingAdminId) {
    req.session.customerId = null;

    return req.session.save((err) => {
      if (err) {
        console.error("Customer logout error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not log out customer."
        });
      }

      res.json({
        success: true,
        message: "Customer logged out successfully."
      });
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Customer logout error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not log out customer."
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Customer logged out successfully."
    });
  });
});


module.exports = router;
