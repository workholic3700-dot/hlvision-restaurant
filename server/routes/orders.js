
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Allowed order statuses
const allowedStatuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed"
];

// CUSTOMER: Submit a new order
router.post("/", async (req, res) => {
  try {
    const { name, phone, orderType, instructions, items } = req.body;

    if (!name || !phone || !orderType || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required order details."
      });
    }

    if (!["Dine-in", "Takeaway"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order type."
      });
    }

    const validItems = items.every(item =>
      typeof item.name === "string" &&
      item.name.trim() !== "" &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) > 0 &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );

    if (!validItems) {
      return res.status(400).json({
        success: false,
        message: "Invalid order items."
      });
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const result = await pool.query(
      `INSERT INTO orders
       (customer_name, phone, order_type, instructions, items, total)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name.trim(),
        phone.trim(),
        orderType,
        instructions || "",
        JSON.stringify(items),
        total
      ]
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: result.rows[0]
    });

  } catch (error) {
    console.error("Order submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to place your order."
    });
  }
});


// ADMIN: Get all orders
router.get("/", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access."
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      orders: result.rows
    });

  } catch (error) {
    console.error("Fetching orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders."
    });
  }
});


// ADMIN: Update order status
router.patch("/:id/status", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access."
    });
  }

  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status."
      });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2 AND status <> 'Completed'
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Order not found or already completed."
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully.",
      order: result.rows[0]
    });

  } catch (error) {
    console.error("Updating order status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update order status."
    });
  }
});

module.exports = router;
