
const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GALLERY UPLOAD DIRECTORY
const uploadDirectory = path.join(__dirname, "../uploads/gallery");

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
      `gallery-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`
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

// PUBLIC: GET VISIBLE GALLERY IMAGES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM gallery
       WHERE visible = TRUE
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      images: result.rows
    });
  } catch (error) {
    console.error("Fetching gallery error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch gallery images."
    });
  }
});

// ADMIN: GET ALL GALLERY IMAGES
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gallery ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      images: result.rows
    });
  } catch (error) {
    console.error("Admin gallery error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch gallery images."
    });
  }
});

// ADMIN: ADD GALLERY IMAGE
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, category } = req.body;

      if (!title || !category || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Please provide a title, category and picture."
        });
      }

      const imageUrl = `/api/uploads/gallery/${req.file.filename}`;

      const result = await pool.query(
        `INSERT INTO gallery (title, category, image_url)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title.trim(), category.trim(), imageUrl]
      );

      res.status(201).json({
        success: true,
        message: "Gallery picture added successfully.",
        image: result.rows[0]
      });
    } catch (error) {
      console.error("Adding gallery image error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to add gallery picture."
      });
    }
  }
);

// ADMIN: UPDATE GALLERY IMAGE
router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category } = req.body;

      if (!title || !category) {
        return res.status(400).json({
          success: false,
          message: "Please provide a title and category."
        });
      }

      const existing = await pool.query(
        "SELECT * FROM gallery WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gallery picture not found."
        });
      }

      const oldImage = existing.rows[0].image_url;

      const imageUrl = req.file
        ? `/api/uploads/gallery/${req.file.filename}`
        : oldImage;

      const result = await pool.query(
        `UPDATE gallery
         SET title = $1,
             category = $2,
             image_url = $3
         WHERE id = $4
         RETURNING *`,
        [title.trim(), category.trim(), imageUrl, id]
      );

      // DELETE OLD IMAGE IF REPLACED
      if (req.file && oldImage) {
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
        message: "Gallery picture updated successfully.",
        image: result.rows[0]
      });
    } catch (error) {
      console.error("Updating gallery image error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update gallery picture."
      });
    }
  }
);

// ADMIN: CHANGE IMAGE VISIBILITY
router.patch("/:id/visibility", requireAdmin, async (req, res) => {
  try {
    const { visible } = req.body;

    if (typeof visible !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility value."
      });
    }

    const result = await pool.query(
      `UPDATE gallery
       SET visible = $1
       WHERE id = $2
       RETURNING *`,
      [visible, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery picture not found."
      });
    }

    res.json({
      success: true,
      message: "Gallery visibility updated.",
      image: result.rows[0]
    });
  } catch (error) {
    console.error("Gallery visibility error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update gallery visibility."
    });
  }
});

// ADMIN: DELETE GALLERY IMAGE
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM gallery WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gallery picture not found."
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
      message: "Gallery picture deleted successfully."
    });
  } catch (error) {
    console.error("Deleting gallery image error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete gallery picture."
    });
  }
});

// HANDLE IMAGE UPLOAD ERRORS
router.use((error, req, res, next) => {
  if (
    error instanceof multer.MulterError ||
    error.message?.includes("images") ||
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
