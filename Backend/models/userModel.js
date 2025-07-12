// server/models/userModel.js

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Fetches all users from the database.
 */
const findAll = async () => {
  const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id DESC');
  return rows;
};

/**
 * Creates a new user in the database.
 */
const create = async (userData) => {
  // Use a default value for 'role' to prevent errors if it's not provided.
  const { firstName, lastName, email, password, role = 'user' } = userData;
  
  // Hash the plain-text password for security.
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [result] = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, email, hashedPassword, role]
  );
  
  // Return an object representing the new user.
  return { id: result.insertId, ...userData };
};

/**
 * Updates an existing user's information.
 */
const update = async (id, userData) => {
    // Note: This function does not update the password. A separate function
    // should be created for password changes for security reasons.
    const { firstName, lastName, email, role } = userData;
    
    const [result] = await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?',
        [firstName, lastName, email, role, id]
    );
    return result;
};

/**
 * Deletes a user from the database by their ID.
 */
const remove = async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result;
};

/**
 * Finds a single user by their email address (for the login process).
 */
const findByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0]; // Returns the user object or undefined if not found
};

/**
 * Finds a single user by their ID (for getting email before sending a notification).
 */
const findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0]; // Returns the user object or undefined if not found
};


// --- EXPORTS ---
// All functions are exported so they can be used by the controllers.
module.exports = {
  findAll,
  create,
  update,
  remove,
  findByEmail,
  findById
};