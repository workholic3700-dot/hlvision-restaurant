
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const path = require("path");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://192.168.1.12:5173"
  ],
  credentials: true
}));

app.use(express.json());

// SESSION CONFIGURATION
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// SERVE UPLOADED MEAL PICTURES
app.use(
  "/api/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// API ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reservations", require("./routes/reservations"));
app.use("/api/meals", require("./routes/meals"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/website-images", require("./routes/websiteImages"));
app.use("/api/discount-offers", require("./routes/discountOffers"));
app.use("/api/customer-reviews", require("./routes/customerReviews"));

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HLVision backend is running!"
  });
});

// DATABASE CHECK
app.get("/api/database", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database is connected!",
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
