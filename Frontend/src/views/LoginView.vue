<template>
  <div class="login-page">
    <!-- Animated background elements (Unchanged) -->
    <div class="background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>
    
    <div class="login-container">
      <!-- Header (Unchanged) -->
      <div class="header">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Enter your credentials to access your account</p>
      </div>

      <!-- Form (Unchanged) -->
      <form class="form-section" @submit.prevent="handleLogin">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="you@example.com" 
              required
            >
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              placeholder="••••••••" 
              required
            >
            <button 
              type="button" 
              class="password-toggle" 
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>

        <!-- Options (Unchanged) -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            Remember me
          </label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        
        <!-- Error Message Display (Unchanged) -->
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <!-- Submit Button (Unchanged) -->
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else class="btn-text">
            Sign In
            <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12,5 19,12 12,19"></polyline></svg>
          </span>
        </button>
      </form>

      <!-- Footer (Unchanged) -->
      <div class="footer">
        <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// --- STATE MANAGEMENT ---
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref(null);
const router = useRouter();

// --- LOGIN LOGIC ---
async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An unknown error occurred.');
    }

    // --- THIS IS THE CORRECTED LOGIC ---
    // Check for both userId and role in the response from the backend.
    if (data.userId && data.role) {
      
      // 1. Save both pieces of information to localStorage.
      // This allows other parts of the app (like the router guard) to check them.
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.role);
      
      // 2. Redirect the user based on their role.
      if (data.role === 'admin') {
        // If the user is an admin, send them to the admin panel.
        router.push('/admin/users');
      } else {
        // Otherwise, send regular users to their task dashboard.
        router.push('/dashboard');
      }

    } else {
      // This is a safeguard if the backend response is missing data.
      throw new Error('Login response did not contain required user information.');
    }

  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* All CSS remains exactly the same. No changes needed here. */
.footer a { color: #a855f7; text-decoration: none; font-weight: 500; transition: color 0.2s ease; }
.footer a:hover { color: #c084fc; }
.error-text { color: #f87171; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.75rem; border-radius: 8px; text-align: center; margin-bottom: 1.5rem; font-size: 0.875rem; }
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
.input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255, 255, 255, 0.5); pointer-events: none; }
input { width: 100%; padding: 12px 16px 12px 44px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white; font-size: 1rem; transition: all 0.3s ease; backdrop-filter: blur(10px); }
input::placeholder { color: rgba(255, 255, 255, 0.4); }
input:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1); background: rgba(255, 255, 255, 0.1); }
.password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s ease; }
.password-toggle:hover { color: rgba(255, 255, 255, 0.8); background: rgba(255, 255, 255, 0.1); }
.form-options { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.875rem; }
.remember-me { display: flex; align-items: center; color: rgba(255, 255, 255, 0.7); cursor: pointer; }
.remember-me input { width: auto; margin-right: 8px; padding: 0; }
.forgot-password { color: #a855f7; text-decoration: none; transition: color 0.2s ease; }
.forgot-password:hover { color: #c084fc; }
.submit-btn { width: 100%; padding: 12px 24px; background: linear-gradient(135deg, #a855f7, #06b6d4); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: center; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(168, 85, 247, 0.4); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-text { display: flex; align-items: center; gap: 8px; }
.btn-arrow { transition: transform 0.3s ease; }
.submit-btn:hover .btn-arrow { transform: translateX(4px); }
.loading-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>