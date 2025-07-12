<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <header class="page-header">
      <h1>Admin Dashboard</h1>
      <button class="add-user-button" @click="openAddModal">
        + Add User
      </button>
    </header>

    <!-- User Table -->
    <main class="content-section">
      <div v-if="isLoading" class="feedback-message">Loading users...</div>
      <div v-else-if="users.length === 0" class="feedback-message">No users found. Add one to get started.</div>
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.first_name }} {{ user.last_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td class="actions-cell">
              <button class="action-button action-button--assign" @click="openAssignTaskModal(user)">Assign Task</button>
              <button class="action-button" @click="openEditModal(user)">Edit</button>
              <button class="action-button action-button--delete" @click="openDeleteConfirmation(user)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <!-- MODALS -->

    <!-- Add/Edit User Modal -->
    <div v-if="showUserFormModal" class="modal-overlay" @click.self="closeAllModals">
      <div class="modal-content">
        <h3 class="modal-title">{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="handleUserFormSubmit" class="modal-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="currentUser.first_name" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="currentUser.last_name" required>
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" v-model="currentUser.email" required>
          </div>
          <!-- Password field is only shown when CREATING a new user -->
          <div class="form-group" v-if="!isEditing">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="currentUser.password" :required="!isEditing" placeholder="Min. 8 characters">
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" v-model="currentUser.role" required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <!-- Error Message Display -->
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <div class="modal-actions">
            <button type="button" class="button-secondary" @click="closeAllModals">Cancel</button>
            <button type="submit" class="button-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmationModal" class="modal-overlay" @click.self="closeAllModals">
        <div class="modal-content">
            <h3 class="modal-title">Confirm Deletion</h3>
            <p>Are you sure you want to delete <strong>{{ userToDelete.first_name }} {{ userToDelete.last_name }}</strong>? This action cannot be undone.</p>
            <div class="modal-actions">
                <button type="button" class="button-secondary" @click="closeAllModals">Cancel</button>
                <button type="button" class="button-danger" @click="confirmDeleteUser">Yes, Delete</button>
            </div>
        </div>
    </div>

    <!-- Assign Task Modal -->
    <div v-if="showAssignTaskModal" class="modal-overlay" @click.self="closeAllModals">
        <div class="modal-content">
            <h3 class="modal-title">Assign Task</h3>
            <p>To: <strong>{{ userToAssign.first_name }} {{ userToAssign.last_name }}</strong></p>
            <form @submit.prevent="handleAssignTask" class="modal-form">
                <div class="form-group">
                    <label for="taskText">Task Description</label>
                    <textarea id="taskText" v-model="taskToAssign.text" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label for="taskDeadline">Deadline</label>
                    <input type="datetime-local" id="taskDeadline" v-model="taskToAssign.deadline" required>
                </div>

                <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
                
                <div class="modal-actions">
                    <button type="button" class="button-secondary" @click="closeAllModals">Cancel</button>
                    <button type="submit" class="button-primary" :disabled="isSubmitting">
                      {{ isSubmitting ? 'Assigning...' : 'Assign Task' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- STATE MANAGEMENT ---
const users = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref(null);
const API_BASE_URL = 'http://localhost:3000/api';

// State for controlling which modal is open
const showUserFormModal = ref(false);
const showDeleteConfirmationModal = ref(false);
const showAssignTaskModal = ref(false);

// State for holding data for the modals
const isEditing = ref(false);
const currentUser = ref({});
const userToDelete = ref(null);
const userToAssign = ref(null);
const taskToAssign = ref({});

// --- DATA FETCHING METHODS ---

// Fetches all users from the backend to display in the table
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Could not fetch users.');
    users.value = await response.json();
  } catch (err) {
    errorMessage.value = err.message; // Use a dedicated error state
  } finally {
    isLoading.value = false;
  }
};

// --- USER MANAGEMENT LOGIC ---

// Handles both creating a new user and updating an existing one
const handleUserFormSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = null; // Clear previous errors

  const isUpdating = isEditing.value;
  const method = isUpdating ? 'PUT' : 'POST';
  const url = isUpdating ? `${API_BASE_URL}/users/${currentUser.value.id}` : `${API_BASE_URL}/users`;
  
  // Create a clean payload with correct property names for the backend
  const payload = {
    firstName: currentUser.value.first_name,
    lastName: currentUser.value.last_name,
    email: currentUser.value.email,
    role: currentUser.value.role,
  };

  if (!isUpdating) {
    payload.password = currentUser.value.password;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'A server error occurred.');
    }

    fetchUsers(); // Refresh the user list on success
    closeAllModals();
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
};

// Deletes a user after confirmation
const confirmDeleteUser = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userToDelete.value.id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete user.');
    fetchUsers();
    closeAllModals();
  } catch (err) {
    alert(err.message); // Simple alert for delete confirmation is okay
  } finally {
    isSubmitting.value = false;
  }
};

// --- TASK MANAGEMENT LOGIC ---

// Assigns a new task to a user
const handleAssignTask = async () => {
  isSubmitting.value = true;
  errorMessage.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userToAssign.value.id,
        text: taskToAssign.value.text,
        deadline: taskToAssign.value.deadline,
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server failed to create task.');
    }
    
    alert(`Task assigned successfully!`); // Provide success feedback
    closeAllModals();
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
};

// --- MODAL CONTROL FUNCTIONS ---

// Opens the modal for adding a new user, resetting the form
const openAddModal = () => {
  isEditing.value = false;
  currentUser.value = { first_name: '', last_name: '', email: '', password: '', role: 'user' };
  showUserFormModal.value = true;
};

// Opens the modal for editing an existing user, pre-filling the form
const openEditModal = (user) => {
  isEditing.value = true;
  // Create a copy of the user object to avoid modifying the original data in the table directly
  currentUser.value = { ...user };
  showUserFormModal.value = true;
};

const openDeleteConfirmation = (user) => {
  userToDelete.value = user;
  showDeleteConfirmationModal.value = true;
};

const openAssignTaskModal = (user) => {
  userToAssign.value = user;
  taskToAssign.value = { text: '', deadline: '' }; // Reset form
  showAssignTaskModal.value = true;
};

const closeAllModals = () => {
  showUserFormModal.value = false;
  showDeleteConfirmationModal.value = false;
  showAssignTaskModal.value = false;
  errorMessage.value = null; // Clear any errors when a modal is closed
};

// --- LIFECYCLE HOOK ---
// Fetch all users when the component is first created and added to the page.
onMounted(fetchUsers);
</script>

<style scoped>
/* Your simple and effective styles are perfect for this component. */
.admin-dashboard { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { font-size: 2rem; }
.content-section { background-color: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.user-table { width: 100%; border-collapse: collapse; text-align: left; }
.user-table th, .user-table td { padding: 1rem; border-bottom: 1px solid #f0f0f0; }
.user-table th { background-color: #fafafa; }
.actions-cell { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.action-button { background: none; border: 1px solid #ccc; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
.action-button:hover { background-color: #f0f0f0; }
.action-button--assign { border-color: #007aff; color: #007aff; }
.action-button--delete { border-color: #d9534f; color: #d9534f; }
.add-user-button, .button-primary { background-color: #007aff; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.add-user-button:hover, .button-primary:hover { background-color: #0056b3; }
.button-primary:disabled { background-color: #a0c7ff; cursor: not-allowed; }
.button-secondary { background-color: #e9ecef; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.button-secondary:hover { background-color: #ced4da; }
.button-danger { background-color: #d9534f; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.button-danger:hover { background-color: #c9302c; }
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background-color: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-title { margin-top: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
.feedback-message { text-align: center; padding: 2rem; color: #6c757d; }
.error-text { color: #d9534f; background-color: rgba(217, 83, 79, 0.1); padding: 0.75rem; border-radius: 6px; text-align: center; margin-top: 1rem; }
</style>