/**
 * server/routes/auth.js
 * Hotel Registration & Login Logic
 */
const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// REGISTER HOTEL
router.post("/register", async (req, res) => {
  console.log("Incoming Registration:", req.body); // Useful for debugging
  const { name, email, password, phone } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO hotels (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, hashedPassword, phone],
    );
    res.json({ message: "Hotel Registered", id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN HOTEL
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query("SELECT * FROM hotels WHERE email = $1", [
    email,
  ]);
  if (result.rows.length === 0)
    return res.status(400).json({ error: "User not found" });

  const validPass = await bcrypt.compare(password, result.rows[0].password);
  if (!validPass) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
  res.json({ token, hotelName: result.rows[0].name });
});

router.get("/me", auth, async (req, res) => {
  try {
    // Query the hotel name and related stats
    const hotel = await db.query("SELECT name FROM hotels WHERE id = $1", [
      req.hotelId,
    ]);
    const employees = await db.query(
      "SELECT * FROM employees WHERE hotel_id = $1",
      [req.hotelId],
    );
    const rooms = await db.query("SELECT * FROM rooms WHERE hotel_id = $1", [
      req.hotelId,
    ]);

    res.json({
      hotelName: hotel.rows[0].name,
      employees: employees.rows,
      rooms: rooms.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
