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
// server/routes/auth.js

router.post("/login", async (req, res) => {
  const { email: identifier, password } = req.body;

  try {
    // 1. Check if it's the Hotel Owner (Email login)
    let userResult = await db.query("SELECT * FROM hotels WHERE email = $1", [
      identifier,
    ]);
    let systemRole = "manager";

    // 2. If not found, check the Employees table (Code login)
    if (userResult.rows.length === 0) {
      userResult = await db.query(
        "SELECT * FROM employees WHERE employee_code = $1",
        [identifier],
      );

      if (userResult.rows.length > 0) {
        const emp = userResult.rows[0];
        // NEW: Check the employee's job title.
        // If it contains 'Manager', grant them system manager permissions.
        const jobTitle = (emp.role || "").toLowerCase();
        systemRole = jobTitle.includes("manager") ? "manager" : "staff";
      }
    }

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // 3. Password Check (Keep your existing logic)
    const isManagerLogin = !user.employee_code; // If no code, it's the hotel owner
    if (isManagerLogin) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });
    } else {
      if (password !== user.password_hash) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
    }

    // 4. Generate Token with the CORRECT systemRole
    const token = jwt.sign(
      {
        id: user.hotel_id || user.id,
        userId: user.id,
        role: systemRole, // Use the detected role
      },
      process.env.JWT_SECRET,
    );

    res.json({ token, role: systemRole, name: user.name });
  } catch (err) {
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
