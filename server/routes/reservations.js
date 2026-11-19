
const express = require("express");
const router = express.Router();
const pool = require("../db");

// CUSTOMER: Submit a reservation
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      date,
      time,
      attendees,
      celebration,
      celebrationType,
      selectedFoods,
      otherFood,
      requests
    } = req.body;

    if (
      !name ||
      !phone ||
      !date ||
      !time ||
      !attendees ||
      !celebration ||
      !Array.isArray(selectedFoods) ||
      selectedFoods.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required reservation details."
      });
    }

    const guests = Number(attendees);

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of guests must be at least one."
      });
    }

    if (!["Yes", "No"].includes(celebration)) {
      return res.status(400).json({
        success: false,
        message: "Invalid celebration selection."
      });
    }

    const result = await pool.query(
      `INSERT INTO reservations (
        customer_name,
        phone,
        email,
        reservation_date,
        reservation_time,
        guests,
        celebration,
        celebration_type,
        preferred_food,
        other_food,
        special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name.trim(),
        phone.trim(),
        email || null,
        date,
        time,
        guests,
        celebration,
        celebration === "Yes" ? celebrationType || null : null,
        JSON.stringify(selectedFoods),
        otherFood || null,
        requests || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Reservation submitted successfully!",
      reservation: result.rows[0]
    });

  } catch (error) {
    console.error("Reservation submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit reservation."
    });
  }
});


// ADMIN: Get all reservations
router.get("/", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in."
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM reservations ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      reservations: result.rows
    });

  } catch (error) {
    console.error("Fetching reservations error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch reservations."
    });
  }
});


// ADMIN: Update reservation status
router.patch("/:id/status", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in."
    });
  }

  try {
    const reservationId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled"
    ];

    if (!Number.isInteger(reservationId) || reservationId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status."
      });
    }

    const existing = await pool.query(
      "SELECT status FROM reservations WHERE id = $1",
      [reservationId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found."
      });
    }

    if (
      ["Completed", "Cancelled"].includes(existing.rows[0].status)
    ) {
      return res.status(400).json({
        success: false,
        message: "This reservation can no longer be changed."
      });
    }

    const result = await pool.query(
      `UPDATE reservations
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, reservationId]
    );

    res.json({
      success: true,
      message: "Reservation status updated successfully.",
      reservation: result.rows[0]
    });

  } catch (error) {
    console.error("Updating reservation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update reservation."
    });
  }
});

module.exports = router;
