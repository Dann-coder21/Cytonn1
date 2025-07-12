<template>
  <div class="login-page">
    <!-- Animated background -->
    <div class="background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>
    
    <div class="login-container">
      <!-- Header -->
      <div class="header">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Join our platform to manage your tasks</p>
      </div>

      <!-- Form -->
      <form class="form-section" @submit.prevent="handleRegister">
        <!-- Name Fields -->
        <div class="form-row">
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" v-model="formData.firstName" placeholder="John" required>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" v-model="formData.lastName" placeholder="Doe" required>
            </div>
        </div>

        <!-- Email and Password Fields -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" v-model="formData.email" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="formData.password" placeholder="••••••••" required>
        </div>

        <!-- Admin Code Field (No logic change needed here) -->
        <div class="form-group">
          <label for="adminCode">Admin Code (Optional)</label>
          <input type="text" id="adminCode" v-model="formData.adminCode" placeholder="Enter code for admin access">
        </div>
        
        <!-- Messages -->
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else class="btn-text">Sign Up</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="footer">
        <p>Already have an account? <router-link to="/">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// --- STATE MANAGEMENT ---
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  adminCode: '' // The admin code entered by the user
});

const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const router = useRouter();

// --- REGISTRATION LOGIC (RECTIFIED) ---
async function handleRegister() {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  // No more secret key on the frontend.
  // We send the code directly to the backend for validation.

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The body now includes the adminCode. If the field is empty, it will be an empty string.
      // The backend will handle the logic.
      body: JSON.stringify({
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          email: formData.value.email,
          password: formData.value.password,
          adminCode: formData.value.adminCode // Send whatever the user typed
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The backend now provides a clear error message if registration fails.
      throw new Error(data.error || 'Registration failed. Please try again.');
    }

    // The success message now comes from the backend's response for better feedback.
    successMessage.value = `${data.message}. Redirecting to login...`;
    
    // Redirect to the login page after a short delay.
    setTimeout(() => {
        router.push('/');
    }, 2000);

  } catch (err) {
    // Display any error that occurred during the process.
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* All your existing styles remain unchanged. */
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.footer a { color: #a855f7; text-decoration: none; font-weight: 500; }
.error-text, .success-text { padding: 0.75rem; border-radius: 8px; text-align: center; margin-bottom: 1.5rem; font-size: 0.875rem; }
.error-text { color: #f87171; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
.success-text { color: #34d399; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
* { box-sizing: border-box; }
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); position: relative; overflow: hidden; }
.background-effects { position: absolute; inset: 0; overflow: hidden; }
.floating-orb { position: absolute; border-radius: 50%; filter: blur(40px); mix-blend-mode: multiply; animation: float 6s ease-in-out infinite; }
.orb-1 { width: 320px; height: 320px; background: #a855f7; top: -160px; right: -160px; opacity: 0.7; }
.orb-2 { width: 320px; height: 320px; background: #06b6d4; bottom: -160px; left: -160px; opacity: 0.7; animation-delay: 2s; }
.orb-3 { width: 320px; height: 320px; background: #ec4899; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.7; animation-delay: 4s; }
@keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.1); } }
.login-container { width: 100%; max-width: 400px; padding: 2rem; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25); position: relative; z-index: 10; }
.header { text-align: center; margin-bottom: 2rem; }
.logo-icon { width: 64px; height: 64px; margin: 0 auto 1rem; background: linear-gradient(135deg, #a855f7, #06b6d4); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3); }
h1 { font-size: 2rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
.subtitle { color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin: 0; }
.form-section { margin-bottom: 2rem; }
.form-group { margin-bottom: 1.5rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: rgba(255, 255, 255, 0.8); font-size: 0.875rem; }
.input-wrapper { position: relative; }
input { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-size: 1rem; transition: all 0.3s ease; backdrop-filter: blur(10px); }
input::placeholder { color: rgba(255, 255, 255, 0.4); }
input:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1); background: rgba(255, 255, 255, 0.1); }
.submit-btn { width: 100%; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #06b6d4); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: center; }
.loading-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>