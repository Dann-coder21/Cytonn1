<template>
  <div class="taskboard-container">
    
    <!-- Page Header -->
    <header class="page-header">
      <h1>My Assigned Tasks</h1>
      <p>Here are the objectives assigned to you. Update the status as you make progress.</p>
    </header>

    <!-- Main Content: Task List -->
    <main class="content-section">
      <!-- 1. Loading State: Shown while fetching data -->
      <div v-if="isLoading" class="feedback-message">Loading your tasks...</div>

      <!-- 2. Error State: Shown if the API call fails -->
      <div v-else-if="error" class="feedback-message error-message">
        {{ error }}
      </div>

      <!-- 3. No Tasks State: Shown if the user has no tasks assigned -->
      <div v-else-if="tasks.length === 0" class="feedback-message">
        <h3>You have no assigned tasks!</h3>
        <p>Enjoy your day or wait for an admin to assign you a task.</p>
      </div>
      
      <!-- 4. Task List: The main display, shown when tasks are successfully loaded -->
      <div v-else class="task-list">
        <!-- Loop through each task and create a row for it -->
        <div class="task-item" v-for="task in tasks" :key="task.id">
          
          <div class="task-details">
            <span class="task-icon">{{ task.icon }}</span>
            <div class="task-text-group">
              <span class="task-text">{{ task.text }}</span>
              <!-- The `task.date` property comes directly from the backend's SQL alias `date_info AS date` -->
              <span class="task-date">Due: {{ new Date(task.date).toLocaleString() }}</span>
            </div>
          </div>
          
          <!-- This select dropdown allows the user to update the task status -->
          <div class="task-actions">
            <select
              class="status-select"
              :value="task.status"
              :class="`status-${task.status}`"
              @change="handleStatusChange(task, $event)"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

        </div>
      </div>
    </main>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- STATE MANAGEMENT ---
const tasks = ref([]);          // Holds the array of tasks fetched from the backend.
const isLoading = ref(true);      // Controls the "Loading..." message.
const error = ref(null);          // Holds any error message if the fetch fails.
const API_URL = 'http://localhost:3000/api/tasks'; // Base API URL for tasks.

// --- API METHODS ---

/**
 * Fetches tasks specifically for the currently logged-in user.
 * This is the primary function that makes the page work.
 */
const fetchTasks = async () => {
  isLoading.value = true;
  error.value = null;

  // IMPORTANT: The login process MUST save the user's ID to localStorage.
  // This is how the frontend knows who is logged in.
  const userId = localStorage.getItem('userId');

  // If there's no userId, we can't fetch tasks.
  if (!userId) {
      error.value = "Could not find your user ID. Please log in again.";
      isLoading.value = false;
      return;
  }
  
  try {
    // This calls the specific backend route we just built: GET /api/tasks/user/:userId
    // For example: http://localhost:3000/api/tasks/user/3
    const response = await fetch(`${API_URL}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Could not fetch your tasks from the server.');
    }
    
    // Parse the JSON response from the server and store it in our `tasks` array.
    tasks.value = await response.json();

  } catch (err) {
    // If anything goes wrong, store the error message to display it in the UI.
    error.value = err.message;
  } finally {
    // No matter what happens, stop showing the "Loading..." message.
    isLoading.value = false;
  }
};

/**
 * Updates the status of a task when the user changes the dropdown.
 */
const handleStatusChange = async (task, event) => {
  const newStatus = event.target.value;
  const originalStatus = task.status; // Keep the old status in case the server update fails.
  
  // Update the UI immediately for a snappy user experience.
  task.status = newStatus;

  try {
    // This calls the backend route you already had: PUT /api/tasks/:id
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }), // Send the new status in the request body.
    });

    if (!response.ok) {
      throw new Error('Failed to update status on the server.');
    }
    // If successful, we don't need to do anything else. The UI is already updated.

  } catch (err) {
    alert('Could not update task. Reverting change.');
    // If the server update fails, change the status back in the UI.
    task.status = originalStatus;
  }
};

// --- LIFECYCLE HOOK ---
// `onMounted` is a Vue function that runs automatically one time,
// right after the component has been added to the page.
// This is the perfect place to make our initial API call.
onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
/* These simple styles are self-contained and require no external frameworks. */
.taskboard-container { font-family: sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; background-color: #f8f9fa; }
.page-header { margin-bottom: 2rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem; }
h1 { font-size: 2rem; margin: 0; }
p { color: #666; }
.content-section { background-color: #ffffff; border-radius: 8px; padding: 1.5rem; border: 1px solid #e9ecef; }
.task-list { display: flex; flex-direction: column; gap: 1rem; }
.task-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #f0f0f0; }
.task-item:last-child { border-bottom: none; }
.task-details { display: flex; align-items: center; gap: 1rem; }
.task-icon { font-size: 1.5rem; background-color: #f0f0f0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.task-text-group { display: flex; flex-direction: column; }
.task-text { font-weight: 500; }
.task-date { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
.status-select { padding: 0.5rem 0.75rem; border-radius: 6px; font-weight: 500; border: 1px solid; cursor: pointer; }
.status-Pending, .status-In { color: #f0ad4e; border-color: #f0ad4e; } 
.status-Completed { color: #5cb85c; border-color: #5cb85c; }
.feedback-message { padding: 3rem 1rem; text-align: center; color: #888; }
.error-message { color: #d9534f; font-weight: 500; }
</style>