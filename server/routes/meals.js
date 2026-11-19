
const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDirectory = path.join(__dirname, "../uploads/meals");

fs.mkdirSync(uploadDirectory, { recursive: true });

// Image storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `meal-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`);
  }
});

// Allow image files only
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
  }
});

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

// PUBLIC: GET ALL MEALS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM meals ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      meals: result.rows
    });
  } catch (error) {
    console.error("Fetching meals error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch meals."
    });
  }
});


// ADMIN: ADD NEW MEAL
router.post("/", requireAdmin, upload.array("images", 10), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;

    if (!name || !category || !price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a meal name, category and valid price."
      });
    }

    const imageUrls = req.files
      ? req.files.map(
          (file) => `/api/uploads/meals/${file.filename}`
        )
      : [];

    const firstImage = imageUrls.length > 0 ? imageUrls[0] : null;

    const result = await pool.query(
      `INSERT INTO meals
       (name, category, price, description, image_url, image_urls)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name.trim(),
        category,
        Number(price),
        description || "",
        firstImage,
        JSON.stringify(imageUrls)
      ]
    );

    res.status(201).json({
      success: true,
      message: "Meal added successfully.",
      meal: result.rows[0]
    });

  } catch (error) {
    console.error("Adding meal error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add meal."
    });
  }
});



// ADMIN: UPDATE MEAL
router.put("/:id", requireAdmin, upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, available } = req.body;

    if (!name || !category || !price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a meal name, category and valid price."
      });
    }

    const existing = await pool.query(
      "SELECT * FROM meals WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meal not found."
      });
    }

    const oldMeal = existing.rows[0];

    const oldImages = oldMeal.image_urls?.length
      ? oldMeal.image_urls
      : oldMeal.image_url
        ? [oldMeal.image_url]
        : [];

    const newImages = req.files && req.files.length > 0
      ? req.files.map(
          (file) => `/api/uploads/meals/${file.filename}`
        )
      : oldImages;

    const firstImage = newImages.length > 0
      ? newImages[0]
      : null;

    const result = await pool.query(
      `UPDATE meals
       SET name = $1,
           category = $2,
           price = $3,
           description = $4,
           image_url = $5,
           image_urls = $6,
           available = $7
       WHERE id = $8
       RETURNING *`,
      [
        name.trim(),
        category,
        Number(price),
        description || "",
        firstImage,
        JSON.stringify(newImages),
        available === "false" ? false : true,
        id
      ]
    );

    // Delete old pictures only when new pictures replace them
    if (req.files && req.files.length > 0) {
      oldImages.forEach((image) => {
        const imagePath = path.join(
          uploadDirectory,
          path.basename(image)
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    res.json({
      success: true,
      message: "Meal updated successfully.",
      meal: result.rows[0]
    });

  } catch (error) {
    console.error("Updating meal error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update meal."
    });
  }
});


// ADMIN: CHANGE MEAL AVAILABILITY
router.patch("/:id/availability", requireAdmin, async (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid availability value."
      });
    }

    const result = await pool.query(
      `UPDATE meals
       SET available = $1
       WHERE id = $2
       RETURNING *`,
      [available, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meal not found."
      });
    }

    res.json({
      success: true,
      message: "Meal availability updated.",
      meal: result.rows[0]
    });
  } catch (error) {
    console.error("Availability update error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update availability."
    });
  }
});

// ADMIN: DELETE MEAL
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM meals WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meal not found."
      });
    }

    const imageUrl = result.rows[0].image_url;

    if (imageUrl) {
      const imagePath = path.join(
        uploadDirectory,
        path.basename(imageUrl)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({
      success: true,
      message: "Meal deleted successfully."
    });
  } catch (error) {
    console.error("Deleting meal error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete meal."
    });
  }
});

// HANDLE IMAGE UPLOAD ERRORS
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error.message.includes("images")) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
