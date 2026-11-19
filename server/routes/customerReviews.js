
const express = require("express");
const router = express.Router();
const pool = require("../db");

// ADMIN AUTHENTICATION
function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access."
    });
  }

  next();
}

// PUBLIC: GET APPROVED CUSTOMER REVIEWS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, customer_name, location, rating, message, created_at
       FROM customer_reviews
       WHERE status = 'approved'
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    console.error("Fetching customer reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch customer reviews."
    });
  }
});

// PUBLIC: SUBMIT CUSTOMER REVIEW
router.post("/", async (req, res) => {
  try {
    const { customer_name, location, rating, message } = req.body;

    const name = typeof customer_name === "string"
      ? customer_name.trim()
      : "";

    const customerLocation = typeof location === "string"
      ? location.trim()
      : "";

    const reviewMessage = typeof message === "string"
      ? message.trim()
      : "";

    const reviewRating = Number(rating);

    if (!name || !customerLocation || !reviewMessage || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please complete all review fields."
      });
    }

    if (name.length > 100 || customerLocation.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name and location must not exceed 100 characters."
      });
    }

    if (reviewMessage.length < 10 || reviewMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Your review must contain between 10 and 1000 characters."
      });
    }

    if (
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a rating between 1 and 5 stars."
      });
    }

    const result = await pool.query(
      `INSERT INTO customer_reviews
       (customer_name, location, rating, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer_name, location, rating, message, status, created_at`,
      [name, customerLocation, reviewRating, reviewMessage]
    );

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted for approval.",
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Submitting customer review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit your review."
    });
  }
});

// ADMIN: GET ALL CUSTOMER REVIEWS
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM customer_reviews
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    console.error("Admin customer reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch customer reviews."
    });
  }
});

// ADMIN: APPROVE OR REJECT CUSTOMER REVIEW
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status."
      });
    }

    const result = await pool.query(
      `UPDATE customer_reviews
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer review not found."
      });
    }

    res.json({
      success: true,
      message: `Customer review ${status} successfully.`,
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Updating customer review status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update customer review."
    });
  }
});

// ADMIN: DELETE CUSTOMER REVIEW
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM customer_reviews
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer review not found."
      });
    }

    res.json({
      success: true,
      message: "Customer review deleted successfully."
    });

  } catch (error) {
    console.error("Deleting customer review error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete customer review."
    });
  }
});

module.exports = router;

