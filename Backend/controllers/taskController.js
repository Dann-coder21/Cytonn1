// server/controllers/taskController.js

// --- 1. IMPORT REQUIRED MODULES ---
const Task = require('../models/taskModel');
const User = require('../models/userModel'); // Needed to find the user's email
const emailService = require('../services/emailService'); // The reusable email service we created

/**
 * Controller to get ALL tasks from the database.
 */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Controller to update the status of a single task.
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await Task.updateStatusById(id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

// --- 2. THE MODIFIED createTask FUNCTION ---
/**
 * Controller to create a new task and send an email notification.
 */
const createTask = async (req, res) => {
  try {
    const taskData = req.body; // This contains { userId, text, deadline }

    // Step A: Create the task in the database first.
    const newTask = await Task.create(taskData);

    // --- Step B: Email Notification Logic ---
    try {
      // Find the user who was assigned the task to get their email address.
      const assignedUser = await User.findById(taskData.userId); 

      // If we found a user with that ID...
      if (assignedUser && assignedUser.email) {
        // ...call our email service to send the notification.
        await emailService.sendNewTaskEmail(assignedUser.email, newTask);
      } else {
        // Log a warning if the user couldn't be found, but don't crash.
        console.warn(`Could not send email because user with ID ${taskData.userId} was not found.`);
      }
    } catch (emailError) {
      // If the email part fails, we log the error but still consider the main
      // operation a success because the task was created in the database.
      console.error('Email notification failed to send after task creation:', emailError);
    }
    
    // Step C: Send a success response to the frontend.
    res.status(201).json(newTask);

  } catch (error) {
    console.error('Error in the createTask process:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Controller to get all tasks for a SINGLE user.
 */
const getUserTasks = async (req, res) => {
    try {
        const userId = req.params.userId;
        const tasks = await Task.findByUserId(userId);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks for user' });
    }
};


// --- 3. EXPORTS ---
// All controller functions are correctly exported.
module.exports = {
  getAllTasks,
  updateTaskStatus,
  createTask,
  getUserTasks
};