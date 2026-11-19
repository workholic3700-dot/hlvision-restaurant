
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

// VALIDATE OFFER DETAILS
function validateOffer(data) {
  const {
    title,
    meal_id,
    discount_type,
    discount_value,
    start_date,
    end_date
  } = data;

  if (
    !title ||
    !meal_id ||
    !discount_type ||
    discount_value === undefined ||
    discount_value === "" ||
    !start_date ||
    !end_date
  ) {
    return "Please fill in all required fields.";
  }

  if (!Number.isInteger(Number(meal_id)) || Number(meal_id) <= 0) {
    return "Please select a valid meal.";
  }

  if (!["percentage", "fixed"].includes(discount_type)) {
    return "Invalid discount type.";
  }

  const value = Number(discount_value);

  if (!Number.isFinite(value) || value <= 0) {
    return "Discount value must be greater than zero.";
  }

  if (discount_type === "percentage" && value > 100) {
    return "Percentage discount cannot exceed 100%.";
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start_date) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end_date)
  ) {
    return "Please provide valid dates.";
  }

  const start = new Date(`${start_date}T00:00:00Z`);
  const end = new Date(`${end_date}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== start_date ||
    end.toISOString().slice(0, 10) !== end_date ||
    end < start
  ) {
    return "Please provide a valid date range.";
  }

  return null;
}

// CALCULATE OFFER PRICE
function calculateOfferPrice(originalPrice, discountType, discountValue) {
  const original = Number(originalPrice);
  const discount = Number(discountValue);

  if (discountType === "percentage") {
    return Number((original - (original * discount / 100)).toFixed(2));
  }

  return Number((original - discount).toFixed(2));
}

// GET MEAL AND ITS ORIGINAL PRICE
async function getMeal(mealId) {
  const result = await pool.query(
    `SELECT id, name, price
     FROM meals
     WHERE id = $1`,
    [mealId]
  );

  return result.rows[0] || null;
}

// SELECT OFFER DETAILS WITH CALCULATED PRICE
const offerSelect = `
  SELECT
    d.*,
    m.name AS meal_name,
    d.original_price -
      CASE
        WHEN d.discount_type = 'percentage'
          THEN d.original_price * d.discount_value / 100
        ELSE d.discount_value
      END AS offer_price
  FROM discount_offers d
  LEFT JOIN meals m ON d.meal_id = m.id
`;

// PUBLIC: GET ACTIVE DISCOUNT OFFERS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `${offerSelect}
       WHERE d.active = TRUE
         AND d.start_date <= CURRENT_DATE
         AND d.end_date >= CURRENT_DATE
       ORDER BY d.created_at DESC`
    );

    res.json({
      success: true,
      offers: result.rows
    });
  } catch (error) {
    console.error("Fetching discount offers error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch discount offers."
    });
  }
});

// ADMIN: GET AVAILABLE MEALS FOR DISCOUNTS
router.get("/meals", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, price
       FROM meals
       WHERE available = TRUE
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      meals: result.rows
    });
  } catch (error) {
    console.error("Fetching meals for discounts error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch meals."
    });
  }
});

// ADMIN: GET ALL DISCOUNT OFFERS
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `${offerSelect}
       ORDER BY d.created_at DESC`
    );

    res.json({
      success: true,
      offers: result.rows
    });
  } catch (error) {
    console.error("Admin discount offers error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch discount offers."
    });
  }
});

// ADMIN: CREATE DISCOUNT OFFER
router.post("/", requireAdmin, async (req, res) => {
  try {
    const validationError = validateOffer(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const {
      title,
      meal_id,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date
    } = req.body;

    const meal = await getMeal(meal_id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Selected meal was not found."
      });
    }

    const originalPrice = Number(meal.price);
    const offerPrice = calculateOfferPrice(
      originalPrice,
      discount_type,
      discount_value
    );

    if (offerPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed the original meal price."
      });
    }

    const result = await pool.query(
      `INSERT INTO discount_offers
       (
         meal_id,
         title,
         description,
         discount_type,
         discount_value,
         original_price,
         start_date,
         end_date,
         active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
       RETURNING *`,
      [
        meal_id,
        title.trim(),
        description || "",
        discount_type,
        Number(discount_value),
        originalPrice,
        start_date,
        end_date
      ]
    );

    res.status(201).json({
      success: true,
      message: "Discount offer created successfully.",
      offer: {
        ...result.rows[0],
        meal_name: meal.name,
        offer_price: offerPrice
      }
    });
  } catch (error) {
    console.error("Creating discount offer error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create discount offer."
    });
  }
});

// ADMIN: UPDATE DISCOUNT OFFER
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const validationError = validateOffer(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const {
      title,
      meal_id,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      active
    } = req.body;

    const meal = await getMeal(meal_id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Selected meal was not found."
      });
    }

    const originalPrice = Number(meal.price);
    const offerPrice = calculateOfferPrice(
      originalPrice,
      discount_type,
      discount_value
    );

    if (offerPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed the original meal price."
      });
    }

    const result = await pool.query(
      `UPDATE discount_offers
       SET meal_id = $1,
           title = $2,
           description = $3,
           discount_type = $4,
           discount_value = $5,
           original_price = $6,
           start_date = $7,
           end_date = $8,
           active = $9
       WHERE id = $10
       RETURNING *`,
      [
        meal_id,
        title.trim(),
        description || "",
        discount_type,
        Number(discount_value),
        originalPrice,
        start_date,
        end_date,
        active === false || active === "false" ? false : true,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount offer not found."
      });
    }

    res.json({
      success: true,
      message: "Discount offer updated successfully.",
      offer: {
        ...result.rows[0],
        meal_name: meal.name,
        offer_price: offerPrice
      }
    });
  } catch (error) {
    console.error("Updating discount offer error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update discount offer."
    });
  }
});

// ADMIN: ACTIVATE OR DEACTIVATE OFFER
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid offer status."
      });
    }

    const result = await pool.query(
      `UPDATE discount_offers
       SET active = $1
       WHERE id = $2
       RETURNING *`,
      [active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount offer not found."
      });
    }

    res.json({
      success: true,
      message: "Offer status updated successfully.",
      offer: result.rows[0]
    });
  } catch (error) {
    console.error("Updating offer status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update offer status."
    });
  }
});

// ADMIN: DELETE DISCOUNT OFFER
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM discount_offers WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discount offer not found."
      });
    }

    res.json({
      success: true,
      message: "Discount offer deleted successfully."
    });
  } catch (error) {
    console.error("Deleting discount offer error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete discount offer."
    });
  }
});

module.exports = router;
