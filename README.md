# Client Project Tracker

A full-stack web application for digital agencies to manage client projects, track their progress, and organize priorities.

The system consists of:
- **Backend:** Laravel 11 REST API
- **Frontend:** React with Vite (dashboard + charts)
- **Database:** MySQL

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Features

- Create, read, update, and delete client projects
- Track project status: Planning, In Progress, On Hold, Completed
- Assign priority levels: Low, Medium, High
- Set start and due dates with validation
- **Dashboard overview** with live stat cards (Total, In Progress, Completed, Overdue)
- **Charts** powered by Recharts:
  - Donut chart: projects by status
  - Bar chart: priority distribution
  - Area chart: upcoming deadlines for the next 6 months
- **Search** projects by client or project name
- **Filter** by status and priority
- **Sort** by due date, priority, or project name
- Form validation on both frontend and backend
- Clean, modern, responsive UI using a teal/gold palette
- RESTful API architecture

---

## Project Structure

```
Tracker/
├── backend/                    Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── ProjectController.php
│   │   │   └── Requests/
│   │   │       ├── StoreProjectRequest.php
│   │   │       └── UpdateProjectRequest.php
│   │   └── Models/
│   │       └── Project.php
│   ├── database/
│   │   └── migrations/
│   │       └── ..._create_projects_table.php
│   ├── routes/
│   │   └── api.php
│   ├── .env.example
│   └── composer.json
│
├── frontend/                   React application
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css           Global styles + design tokens
│   │   ├── components/
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   └── ProjectsPage.jsx
│   │   └── utils/
│   │       └── constants.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running this project, install the following tools on your machine. Follow the installation instructions for your operating system.

### 1. PHP (version 8.2 or higher)

**Windows:**
1. Download PHP from https://windows.php.net/download/
2. Choose the "Thread Safe" version compatible with your architecture
3. Extract to `C:\php`
4. Add `C:\php` to your system PATH
5. Verify installation: open Command Prompt and run `php -v`

**macOS:**
```bash
brew install php
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install php php-cli php-mbstring php-xml php-mysql php-curl php-zip php-bcmath
```

### 2. Composer (PHP dependency manager)

Download and install from https://getcomposer.org/download/

**Verify:**
```bash
composer -V
```

### 3. MySQL (version 8.0 or higher)

**Windows:**
Download MySQL Installer from https://dev.mysql.com/downloads/installer/

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt install mysql-server
sudo service mysql start
```

**Alternative:** Use XAMPP (https://www.apachefriends.org/) which bundles MySQL and phpMyAdmin for easy database management.

**Verify:**
```bash
mysql --version
```

### 4. Node.js (version 18 or higher) and npm

Download from https://nodejs.org/ and install the LTS version.

**Verify:**
```bash
node -v
npm -v
```

### 5. Git

Download from https://git-scm.com/downloads

**Verify:**
```bash
git --version
```

---

## Installation

### Step 1: Clone the Repository

Open a terminal (Command Prompt, PowerShell, Terminal, or Git Bash) and run:

```bash
git clone https://github.com/YOUR_USERNAME/Tracker.git
cd Tracker
```

Replace `YOUR_USERNAME` with the actual GitHub username where the repository is hosted.

### Step 2: Set Up the Database

Open MySQL using one of these methods:

**Method A: Command Line**
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE project_tracker;
EXIT;
```

**Method B: phpMyAdmin (if using XAMPP)**
1. Open http://localhost/phpmyadmin
2. Click "New" on the left sidebar
3. Enter `project_tracker` as the database name
4. Choose `utf8mb4_general_ci` as collation
5. Click "Create"

### Step 3: Set Up the Backend

Navigate to the backend folder:

```bash
cd backend
```

Install PHP dependencies:

```bash
composer install
```

Create your environment file by copying the example:

**Windows:**
```bash
copy .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

Open the `.env` file in a text editor and update the database configuration to match your local MySQL setup:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=project_tracker
DB_USERNAME=root
DB_PASSWORD=
```

If your MySQL root user has a password, enter it after `DB_PASSWORD=`. If not, leave it empty.

Generate the application encryption key:

```bash
php artisan key:generate
```

Run the database migrations to create all tables:

```bash
php artisan migrate
```

### Step 4: Set Up the Frontend

Open a **new terminal window** (keep the first one available). Navigate to the frontend folder from the project root:

```bash
cd frontend
```

Install JavaScript dependencies:

```bash
npm install
```

> **Note:** The frontend uses **Recharts** for the dashboard charts. It will be installed automatically by `npm install` because it is listed in `package.json`. If for any reason it is missing, install it manually with:
> ```bash
> npm install recharts
> ```

Open `src/api.js` and confirm the API base URL matches your backend:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

If your backend runs on a different host or port, update `baseURL` accordingly.

---

## Running the Application

The application requires **two servers running simultaneously** — one for the backend and one for the frontend.

### Terminal 1: Start the Laravel Backend

```bash
cd Tracker/backend
php artisan serve
```

You should see:

```
INFO  Server running on [http://127.0.0.1:8000].
```

The API is now accessible at http://localhost:8000/api

### Terminal 2: Start the React Frontend

Open a new terminal window:

```bash
cd Tracker/frontend
npm run dev
```

You should see:

```
VITE v5.x.x  ready in 400 ms
➜  Local:   http://localhost:5173/
```

### Access the Application

Open your web browser and navigate to:

```
http://localhost:5173
```

You will see the **Projects Dashboard** where you can:

- View stat cards (Total, In Progress, Completed, Overdue)
- View the three charts (status donut, priority bar, upcoming deadlines)
- Search by client or project name
- Filter by status and priority
- Sort by due date, priority, or project name
- Click **"+ New Project"** to create a project
- Click **Edit** on any row to modify a project
- Click **Delete** to remove a project with confirmation

---

## Troubleshooting

### CORS Error in Browser Console

If you see an error like "Access to XMLHttpRequest has been blocked by CORS policy":

1. Open `backend/config/cors.php`
2. Verify `allowed_origins` includes `http://localhost:5173`:

```php
'allowed_origins' => ['http://localhost:5173'],
```

3. Clear the configuration cache:

```bash
cd backend
php artisan config:clear
```

### 404 Not Found on /api/projects

Verify the routes are registered:

```bash
cd backend
php artisan route:list
```

You should see five project routes. If they are missing, run:

```bash
php artisan install:api
```

### Database Connection Refused

**Error:** `SQLSTATE[HY000] [1045] Access denied for user`

1. Open `backend/.env`
2. Verify `DB_USERNAME` and `DB_PASSWORD` match your MySQL credentials
3. Confirm the database `project_tracker` exists
4. Clear config cache:

```bash
php artisan config:clear
```

### Port Already in Use

**Backend:**
```bash
php artisan serve --port=8001
```

If you change the port, also update `frontend/src/api.js` to match.

**Frontend:**
Vite automatically picks the next available port (5174, 5175, etc.). Check the terminal output for the actual URL.

### Charts Do Not Render

If the dashboard loads but the charts are blank:

1. Verify `recharts` is installed:
   ```bash
   cd frontend
   npm ls recharts
   ```
   If missing, run:
   ```bash
   npm install recharts
   ```
2. Open the browser DevTools console. If you see errors like `Cannot find module 'recharts'`, the install did not complete — rerun it.

### "php" or "composer" Command Not Recognized

The tool is not installed or not added to your system PATH. Reinstall the tool and ensure the installation directory is added to PATH. Restart your terminal after modifying PATH.

### "npm install" Fails

Try clearing the npm cache:

```bash
npm cache clean --force
npm install
```

### Permission Denied on Linux/macOS

Prefix commands with `sudo` where necessary, or fix folder permissions:

```bash
sudo chown -R $USER:$USER Tracker
```

### Migrations Fail With "Unknown Database"

The database has not been created yet. Return to Step 2 in the Installation section and create the `project_tracker` database.

---

## Testing the API Manually

With the backend running, use `curl` to verify endpoints:

**List all projects:**
```bash
curl http://localhost:8000/api/projects
```

**Create a project:**
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Acme Corp",
    "project_name": "Website Redesign",
    "status": "Planning",
    "priority": "High",
    "start_date": "2024-06-01",
    "due_date": "2024-08-01"
  }'
```

**Update a project:**
```bash
curl -X PUT http://localhost:8000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'
```

**Delete a project:**
```bash
curl -X DELETE http://localhost:8000/api/projects/1
```