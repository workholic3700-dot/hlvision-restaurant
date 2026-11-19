
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully!");
    client.release();
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

module.exports = pool;

// $2b$12$3QYEQ5haVrQszn6z4oTYre8pdDwms7Q0KgAjHhz8Hhi2OiPpplIo6

// $2b$12$VHQHYRVinoRIjspltIQMXe9obuaySvX.xoMA0cBzrCJbFcZ.7k8na