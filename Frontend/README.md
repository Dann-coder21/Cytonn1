# Project Task Management - Frontend

This is the frontend for the Full-Stack Task Management System, built with **Vue.js** and **Vue Router**. It provides a user interface for administrators to manage users and tasks, and for regular users to view and update their assigned tasks.

---

## Features

-   **Login Page:** Secure user authentication.
-   **Admin Dashboard:** A protected route for administrators to perform CRUD (Create, Read, Update, Delete) operations on users.
-   **Task Assignment:** Admins can assign new tasks with deadlines to any user.
-   **User Taskboard:** A protected route for logged-in users to view a list of their assigned tasks and update the status (`Pending`, `In Progress`, `Completed`).

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (which includes `npm`, the Node Package Manager)

---

## Getting Started

Follow these steps to get the frontend development server running on your local machine.

### 1. Installation

First, navigate to the frontend project directory in your terminal and install all the necessary packages defined in `package.json`.

```bash
# Navigate to the frontend folder
cd /path/to/your/project/frontend

# Install dependencies
npm install