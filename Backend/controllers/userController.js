// server/controllers/userController.js

// Import the User model to interact with the database
const User = require('../models/userModel');

/**
 * Controller to get all users from the database.
 * Responds with a JSON array of all users.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'Failed to fetch users from the database.' });
  }
};

/**
 * Controller to create a new user.
 * It checks for an optional admin code to assign an 'admin' role.
 * @param {object} req - The Express request object, containing user data in the body.
 * @param {object} res - The Express response object.
 */
const createUser = async (req, res) => {
  try {
    // 1. Destructure all expected data from the request body.
    const { firstName, lastName, email, password, adminCode } = req.body;

    // 2. Perform basic validation to ensure no required fields are missing.
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    // 3. Determine the user's role. Default to 'user'.
    let role = 'user'; 
    
    // 4. If an admin code is provided, check if it matches the one in your .env file.
    if (adminCode && adminCode === process.env.ADMIN_REGISTRATION_CODE) {
      role = 'admin';
    }

    // 5. Create a clean userData object to pass to the model.
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role // This will now be either 'user' or 'admin', preventing null errors.
    };
    
    // 6. Call the model function to create the user in the database.
    const newUser = await User.create(userData);
    
    // 7. Send a clear success message and the new user's ID back to the frontend.
    res.status(201).json({ 
      message: `User created successfully as ${role}`, 
      userId: newUser.id 
    });

  } catch (error) {
    // This specific error code means a duplicate email was attempted.
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email address is already registered.' });
    }

    // For any other type of error, log it for debugging and send a generic server error.
    console.error('Error creating user:', error); 
    res.status(500).json({ error: 'An unexpected error occurred while creating the user.' });
  }
};

/**
 * Controller to update an existing user's information.
 * @param {object} req - The Express request object, with user ID in params and data in body.
 * @param {object} res - The Express response object.
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // The user ID from the URL (e.g., /api/users/7)
    const { firstName, lastName, email, role } = req.body; // The new data from the form

    // --- THIS IS THE KEY CORRECTION ---
    // Add robust validation to prevent "cannot be null" errors.
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ error: 'First name, last name, email, and role are required fields.' });
    }
    
    // Create a clean payload object to pass to the model
    const userData = { firstName, lastName, email, role };

    const result = await User.update(id, userData);
    
    // If no database rows were affected, it means the user ID was not found.
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or data is unchanged.' });
    }
    
    // Send a success response.
    res.status(200).json({ message: 'User updated successfully.' });

  } catch (error) {
    // Handle potential duplicate email errors during an update as well.
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This email address is already in use by another account.' });
    }
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

/**
 * Controller to delete a user by their ID.
 * @param {object} req - The Express request object, with user ID in params.
 * @param {object} res - The Express response object.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.remove(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};


// Export all controller functions so they can be used in the routes file.
module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};