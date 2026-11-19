
const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// WEBSITE IMAGE UPLOAD DIRECTORY
const uploadDirectory = path.join(__dirname, "../uploads/website");

fs.mkdirSync(uploadDirectory, { recursive: true });

// IMAGE STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `website-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`
    );
  }
});

// IMAGE UPLOAD CONFIGURATION
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

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

// PUBLIC: GET WEBSITE IMAGES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT section_key, image_url FROM website_images"
    );

    const images = {};

    result.rows.forEach((image) => {
      images[image.section_key] = image.image_url;
    });

    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error("Fetching website images error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch website images."
    });
  }
});

// ADMIN: GET WEBSITE IMAGES
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM website_images ORDER BY id ASC"
    );

    res.json({
      success: true,
      images: result.rows
    });
  } catch (error) {
    console.error("Admin website images error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch website images."
    });
  }
});

// ADMIN: REPLACE WEBSITE IMAGE
router.put(
  "/:section",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    let uploadedFile = req.file;

    try {
      const { section } = req.params;

      if (!["hero", "about"].includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid website image section."
        });
      }

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Please select an image."
        });
      }

      const existing = await pool.query(
        "SELECT * FROM website_images WHERE section_key = $1",
        [section]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Website image record not found."
        });
      }

      const oldImage = existing.rows[0].image_url;
      const imageUrl = `/api/uploads/website/${uploadedFile.filename}`;

      const result = await pool.query(
        `UPDATE website_images
         SET image_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE section_key = $2
         RETURNING *`,
        [imageUrl, section]
      );

      // DELETE OLD UPLOADED IMAGE AFTER SUCCESSFUL UPDATE
      if (oldImage && oldImage.startsWith("/api/uploads/website/")) {
        const oldPath = path.join(
          uploadDirectory,
          path.basename(oldImage)
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      res.json({
        success: true,
        message: "Website image updated successfully.",
        image: result.rows[0]
      });
    } catch (error) {
      // Remove new upload if database update fails
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }

      console.error("Updating website image error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update website image."
      });
    }
  }
);

// HANDLE IMAGE UPLOAD ERRORS
router.use((error, req, res, next) => {
  if (
    error instanceof multer.MulterError ||
    error.message?.includes("Only JPG")
  ) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
