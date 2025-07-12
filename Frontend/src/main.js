import { createApp } from 'vue'
import App from './App.vue'

// Import your stylesheet from the correct location
import './style.css' 

// Import the router instance you configured in src/router/index.js
import router from './router' 

// Import Pinia for state management
import { createPinia } from 'pinia'

// Creates the main application instance
const app = createApp(App)

// Tells the application to use Pinia
app.use(createPinia())

// Tells the application to use the router
app.use(router) 

// Mounts the application to the DOM
app.mount('#app')
