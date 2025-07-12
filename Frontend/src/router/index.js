// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue' // Import LoginView directly for the default route

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView // This is now the default page
    },

     {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue') // Lazily load the component
    },
    
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      // --- ADD THIS META FIELD ---
      // We add a "meta" field to tell our navigation guard that this route requires authentication.
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserManagementView.vue'),
      // --- ADD THIS META FIELD ---
      // This route also requires authentication.
      meta: { requiresAuth: true }
    },
    // It's good practice to have a catch-all for any other routes
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})


// --- THIS IS THE NAVIGATION GUARD ---
/**
 * This function runs before each route navigation.
 * `to`: The route the user is trying to go to.
 * `from`: The route the user is coming from.
 * `next`: A function that must be called to resolve the hook.
 */
router.beforeEach((to, from, next) => {
  // 1. Check if the route the user is trying to access requires authentication.
  // We do this by checking our custom `meta.requiresAuth` field.
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 2. Check if the user is logged in.
  // We do this by checking if the `userId` exists in localStorage.
  const isLoggedIn = localStorage.getItem('userId');

  // 3. Implement the logic.
  if (requiresAuth && !isLoggedIn) {
    // If the route requires authentication AND the user is NOT logged in,
    // redirect them to the login page.
    next({ name: 'login' });
  } else if (to.name === 'login' && isLoggedIn) {
    // If the user is already logged in and tries to go to the login page,
    // redirect them to their dashboard instead.
    next({ name: 'dashboard' });
  } else {
    // Otherwise, the user is allowed to proceed to their desired destination.
    next();
  }
});


export default router;