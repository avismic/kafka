const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// BULK UPDATE EMPLOYEES
router.post("/employees/bulk", auth, async (req, res) => {
  const { employees } = req.body; // Array of employee objects
  try {
    // 1. Clear existing records for this hotel to prevent duplicates (Sync strategy)
    await db.query("DELETE FROM employees WHERE hotel_id = $1", [req.hotelId]);

    // 2. Construct multi-row insert
    for (let emp of employees) {
      await db.query(
        "INSERT INTO employees (hotel_id, name, email, role, department) VALUES ($1, $2, $3, $4, $5)",
        [req.hotelId, emp.name, emp.email, emp.role, emp.dept],
      );
    }
    res.json({ message: "Employees synchronized with Neon" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/rooms/bulk", auth, async (req, res) => {
  const { rooms } = req.body;
  try {
    // Clear existing rooms for this specific hotel
    await db.query("DELETE FROM rooms WHERE hotel_id = $1", [req.hotelId]);

    for (let room of rooms) {
      await db.query(
        "INSERT INTO rooms (hotel_id, number, type, status, last_cleaned) VALUES ($1, $2, $3, $4, $5)",
        [req.hotelId, room.number, room.type, room.status, room.lastCleaned],
      );
    }
    res.json({ message: "Rooms synchronized with Neon" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/employees/:id", auth, async (req, res) => {
  const { name, email, role } = req.body;
  try {
    await db.query(
      "UPDATE employees SET name = $1, email = $2, role = $3 WHERE id = $4 AND hotel_id = $5",
      [name, email, role, req.params.id, req.hotelId],
    );
    res.json({ message: "Employee updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/rooms/:id", auth, async (req, res) => {
  const { number, type, status } = req.body;
  try {
    await db.query(
      "UPDATE rooms SET number = $1, type = $2, status = $3 WHERE id = $4 AND hotel_id = $5",
      [number, type, status, req.params.id, req.hotelId],
    );
    res.json({ message: "Room updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE SINGLE EMPLOYEE
router.delete('/employees/:id', auth, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM employees WHERE id = $1 AND hotel_id = $2',
            [req.params.id, req.hotelId]
        );
        res.json({ message: "Employee deleted from database" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
