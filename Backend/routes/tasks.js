// Backend/routes/tasks.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET all tasks (for admin purposes, likely)
router.get('/', taskController.getAllTasks);

// POST a new task (for assigning)
router.post('/', taskController.createTask);


// --- ADD THIS NEW ROUTE ---
// This is the route your Taskboard.vue page needs to fetch data.
// The ':userId' part is a URL parameter.
router.get('/user/:userId', taskController.getUserTasks);


// PUT updates a specific task by its ID
router.put('/:id', taskController.updateTaskStatus);


module.exports = router;