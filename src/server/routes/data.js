const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// BULK UPDATE EMPLOYEES
// UPDATE BULK SYNC TO INCLUDE CODES AND PASSWORDS
router.post("/employees/bulk", auth, async (req, res) => {
  const { employees } = req.body;
  try {
    await db.query("DELETE FROM employees WHERE hotel_id = $1", [req.hotelId]);

    for (let emp of employees) {
      // We store the plain password for your Excel export later,
      // but in production, we should hash this immediately.
      await db.query(
        `INSERT INTO employees (hotel_id, name, email, role, department, employee_code, password_hash) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          req.hotelId,
          emp.name,
          emp.email,
          emp.role,
          emp.dept,
          emp.code,
          emp.tempPassword,
        ],
      );
    }
    res.json({ message: "Employee directory updated with login access." });
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
router.delete("/employees/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM employees WHERE id = $1 AND hotel_id = $2", [
      req.params.id,
      req.hotelId,
    ]);
    res.json({ message: "Employee deleted from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE NEW TASK
router.post("/tasks", auth, async (req, res) => {
  const {
    id,
    type,
    assignee,
    assigneeId,
    destination,
    duration,
    checklist,
    notes,
  } = req.body;
  try {
    await db.query(
      `INSERT INTO tasks (id, hotel_id, assignee_id, created_by_id, type, assignee_name, destination, duration, checklist, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        req.hotelId,
        assigneeId,
        req.userId, // Captured from the auth token
        type,
        assignee,
        destination,
        duration,
        JSON.stringify(checklist),
        notes,
        "pending",
      ],
    );
    res.status(201).json({ message: "Task persistent with ID tracking" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TASK STATUS (Complete)
router.patch("/tasks/:id/status", auth, async (req, res) => {
  try {
    await db.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 AND hotel_id = $3",
      [req.body.status, req.params.id, req.hotelId],
    );
    res.json({ message: "Task status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL TASKS FOR THE HOTEL
router.get("/tasks", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tasks WHERE hotel_id = $1 ORDER BY id DESC",
      [req.hotelId],
    );

    // Convert the database rows back to the frontend format
    const tasks = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      assignee: row.assignee_name,
      assigneeId: row.assignee_id,
      destination: row.destination,
      duration: row.duration,
      checklist: row.checklist, // JSONB is automatically parsed by pg
      notes: row.notes,
      status: row.status,
    }));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE EMPLOYEE CREDENTIALS (Code & Password)
router.patch("/employees/:id/credentials", auth, async (req, res) => {
  const { employee_code, password_hash } = req.body;
  try {
    await db.query(
      `UPDATE employees 
             SET employee_code = $1, password_hash = $2 
             WHERE id = $3 AND hotel_id = $4`,
      [employee_code, password_hash, req.params.id, req.hotelId],
    );
    res.json({ message: "Credentials updated successfully" });
  } catch (err) {
    // Handle unique constraint violation if code is already taken
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "This Employee Code is already in use." });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
