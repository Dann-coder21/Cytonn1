// Backend/controllers/authController.js

// Import the User model to find users in the database
const User = require('../models/userModel');

// Import the bcryptjs library for secure password comparison
const bcrypt = require('bcryptjs');

/**
 * Handles the user login process.
 * It verifies credentials and responds with the user's ID and role.
 */
const login = async (req, res) => {
    try {
        // 1. Get email and password from the frontend request body
        const { email, password } = req.body;

        // 2. Basic Validation: Check if email or password were provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // 3. Find the user in the database by their email address
        const user = await User.findByEmail(email);

        // 4. If no user is found, return a generic "401 Unauthorized" error
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 5. Securely compare the submitted password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        // If the passwords do not match, return the same generic "401 Unauthorized" error
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 6. SUCCESS! The user is authenticated.
        // Send a success response including the user's ID AND their role.
        // The frontend needs both pieces of data to function correctly.
        res.status(200).json({ 
            message: 'Login successful', 
            userId: user.id,
            role: user.role // <-- THIS IS THE CORRECTED LINE
        });

    } catch (error) {
        // If any other unexpected server error occurs, log it for debugging and send a 500 error.
        console.error('An error occurred during the login process:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Export the login function so it can be used in your `routes/auth.js` file
module.exports = {
    login
};