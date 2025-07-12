// Backend/routes/auth.js
console.log("--- Loading routes/auth.js file ---"); // <-- ADD THIS

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log("Defining POST /login route..."); // <-- ADD THIS
router.post('/login', authController.login);
console.log("✅ POST /login route defined."); // <-- ADD THIS

module.exports = router;