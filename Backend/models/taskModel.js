// Backend/models/taskModel.js

// Import the database connection pool
const pool = require('../config/database');

/**
 * Fetches ALL tasks from the database.
 * Used for an admin overview, not for a specific user.
 */
const findAll = async () => {
  // CORRECTED: The query now uses the correct column names.
  // The alias `date_info AS date` is kept for frontend convenience if needed.
  const [rows] = await pool.query(
    'SELECT id, user_id, icon, text, date_info AS date, status FROM tasks ORDER BY id DESC'
  );
  return rows;
};

/**
 * Updates the status of a single task by its ID.
 * This is used by the user's taskboard.
 */
const updateStatusById = async (id, status) => {
  // This query was already correct as it only uses `status` and `id`.
  const [result] = await pool.query(
    'UPDATE tasks SET status = ? WHERE id = ?', 
    [status, id]
  );
  return result;
};

/**
 * Creates a new task in the database.
 * This is used when an admin assigns a task.
 */
const create = async (task) => {
  const { userId, text, deadline } = task;
  const status = 'Pending';
  const icon = '📋';
  
  // CORRECTED: The query now uses `user_id` instead of `userId` to match the database schema.
  const [result] = await pool.query(
    'INSERT INTO tasks (user_id, icon, text, date_info, status) VALUES (?, ?, ?, ?, ?)',
    [userId, icon, text, deadline, status]
  );

  return { id: result.insertId, ...task, status, icon };
};


/**
 * Finds all tasks for a single user by their user_id.
 * This is the crucial function for the user's dashboard.
 */
const findByUserId = async (userId) => {
  // CORRECTED: The query now selects from and compares against `user_id`.
  // This fixes the 'Unknown column' error because all these columns now exist.
  const [rows] = await pool.query(
    'SELECT id, user_id, icon, text, date_info AS date, status FROM tasks WHERE user_id = ?',
    [userId]
  );
  return rows;
};


// --- EXPORTS ---
// Export all functions so they can be used by the controller files.
module.exports = {
  findAll,
  updateStatusById,
  create,
  findByUserId
};