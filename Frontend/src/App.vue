<template>
  <header class="header" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <div class="nav-wrapper">
        <!-- Logo/Brand -->
        <div class="brand">
          <router-link to="/" class="brand-link">
            <div class="logo">
              <!-- You can keep the logo SVG or replace it too -->
              <svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <span class="brand-text">AppName</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <!-- Links for Logged-Out Users -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/" class="nav-link">
              <v-icon name="md-login" class="nav-icon" />
              <span>Login</span>
            </RouterLink>
            <RouterLink to="/register" class="nav-link">
               <v-icon name="md-appregistration" class="nav-icon" />
              <span>Sign Up</span>
            </RouterLink>
          </template>
          
          <!-- Links for Logged-In Users -->
          <template v-if="isLoggedIn">
            <RouterLink to="/dashboard" class="nav-link">
              <v-icon name="md-dashboard" class="nav-icon" />
              <span>Dashboard</span>
            </RouterLink>
            
            <RouterLink v-if="isAdmin" to="/admin/users" class="nav-link">
              <v-icon name="md-adminpanelsettings" class="nav-icon" />
              <span>Admin</span>
            </RouterLink>
            
            <button @click="logout" class="nav-link logout-btn">
              <v-icon name="bi-box-arrow-right" class="nav-icon" />
              <span>Logout</span>
            </button>
          </template>
        </nav>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <!-- Hamburger lines can stay as they are simple spans -->
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div class="mobile-nav" :class="{ 'active': isMobileMenuOpen }">
        <div class="mobile-nav-content">
           <template v-if="!isLoggedIn">
            <RouterLink to="/" class="mobile-nav-link" @click="closeMobileMenu">
              <v-icon name="md-login" class="nav-icon" /> Login
            </RouterLink>
            <RouterLink to="/register" class="mobile-nav-link" @click="closeMobileMenu">
              <v-icon name="md-appregistration" class="nav-icon" /> Sign Up
            </RouterLink>
          </template>
          <template v-if="isLoggedIn">
            <RouterLink to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">
              <v-icon name="md-dashboard" class="nav-icon" /> Dashboard
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/admin/users" class="mobile-nav-link" @click="closeMobileMenu">
              <v-icon name="md-adminpanelsettings" class="nav-icon" /> Admin
            </RouterLink>
            <button @click="logout" class="mobile-nav-link logout-btn">
              <v-icon name="bi-box-arrow-right" class="nav-icon" /> Logout
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>

  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const router = useRouter();

// --- AUTHENTICATION STATE ---
const loggedInStatus = ref(false);

const isLoggedIn = computed(() => loggedInStatus.value);
const isAdmin = computed(() => isLoggedIn.value && localStorage.getItem('userRole') === 'admin');

function updateAuthStatus() {
  loggedInStatus.value = !!localStorage.getItem('userId');
}

function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  updateAuthStatus();
  isMobileMenuOpen.value = false;
  router.push('/');
}

// --- UI LOGIC ---
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
}
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  updateAuthStatus();
  window.addEventListener('storage', updateAuthStatus);
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('storage', updateAuthStatus);
  window.removeEventListener('scroll', handleScroll);
});

// Watch for route changes to update the auth status, useful for back/forward browser buttons
watch(() => router.currentRoute.value, () => {
  updateAuthStatus();
});
</script>

<style scoped>
/* Your CSS requires very few changes */
/* The main change is setting a size for the nav-icon class */
.nav-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.mobile-nav-link .nav-icon {
  margin-right: 12px;
}

.brand-link { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.logout-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: inherit; display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 10px; transition: all 0.3s ease; position: relative; overflow: hidden; }
.logout-btn:hover { color: white; }
.mobile-nav .logout-btn { width: 100%; text-align: left; justify-content: flex-start; margin-bottom: 8px; }
* { box-sizing: border-box; }
.header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(23, 37, 84, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.header.scrolled { background: rgba(23, 37, 84, 0.95); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.nav-wrapper { display: flex; align-items: center; justify-content: space-between; height: 70px; }
.brand { display: flex; align-items: center; gap: 12px; color: white; font-weight: 700; font-size: 1.25rem; }
.logo { width: 40px; height: 40px; background: linear-gradient(135deg, #a855f7, #06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); }
.brand-text { background: linear-gradient(135deg, #a855f7, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.desktop-nav { display: flex; align-items: center; gap: 8px; }
.nav-link { display: flex; align-items: center; gap: 8px; padding: 12px 16px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 10px; transition: all 0.3s ease; position: relative; overflow: hidden; }
.nav-link::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(6, 182, 212, 0.1)); opacity: 0; transition: opacity 0.3s ease; }
.nav-link:hover::before { opacity: 1; }
.nav-link:hover { color: white; transform: translateY(-2px); }
.nav-link.router-link-active { color: white; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2)); box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2); }
.nav-link:hover .nav-icon { transform: scale(1.1); }
.mobile-menu-btn { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.3s ease; }
.mobile-menu-btn:hover { background: rgba(255, 255, 255, 0.1); }
.hamburger-line { width: 24px; height: 2px; background: white; transition: all 0.3s ease; }
.mobile-menu-btn.active .hamburger-line:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
.mobile-menu-btn.active .hamburger-line:nth-child(2) { opacity: 0; }
.mobile-menu-btn.active .hamburger-line:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }
.mobile-nav { position: absolute; top: 100%; left: 0; right: 0; background: rgba(23, 37, 84, 0.98); backdrop-filter: blur(20px); border-top: 1px solid rgba(255, 255, 255, 0.1); transform: translateY(-100%); opacity: 0; visibility: hidden; transition: all 0.3s ease; }
.mobile-nav.active { transform: translateY(0); opacity: 1; visibility: visible; }
.mobile-nav-content { padding: 1rem; }
.mobile-nav-link { display: flex; align-items: center; padding: 16px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 12px; transition: all 0.3s ease; margin-bottom: 8px; background: none; border: none; width: 100%; font-family: inherit; font-size: inherit;}
.mobile-nav-link:hover { color: white; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2)); }
.mobile-nav-link.router-link-active { color: white; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2)); }
.main-content { padding-top: 70px; min-height: 100vh; }
@media (max-width: 768px) { .desktop-nav { display: none; } .mobile-menu-btn { display: flex; } .nav-wrapper { justify-content: space-between; } .brand-text { display: none; } .nav-wrapper { height: 60px; } .main-content { padding-top: 60px; min-height: calc(100vh); } }
</style>