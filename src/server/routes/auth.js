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
// server/routes/auth.js
router.post("/login", async (req, res) => {
  // 1. Match the key name 'email' from your frontend login.js
  const { email: identifier, password } = req.body;

  try {
    // 1. Check if it's a Manager (Email login)
    let userResult = await db.query("SELECT * FROM hotels WHERE email = $1", [
      identifier,
    ]);
    let role = "manager";

    // 2. If not found, check if it's an Employee (Code login)
    if (userResult.rows.length === 0) {
      userResult = await db.query(
        "SELECT * FROM employees WHERE employee_code = $1",
        [identifier],
      );
      role = "staff";
    }

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // 3. Proper Password Validation
    if (role === "manager") {
      // Managers use Bcrypt (since you hash them in /register)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });
    } else {
      // Staff currently use plain text (from your Directory setup)
      if (password !== user.password_hash) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
    }

    // 4. Generate Token
    const token = jwt.sign(
      {
        id: user.hotel_id || user.id, // Hotel Context
        userId: user.id, // Specific User ID
        role: role,
      },
      process.env.JWT_SECRET,
    );

    res.json({ token, role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
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
