# 💰 Finance DIP — Personal Finance Management Web Application

<p align="center">
  <img src="client/src/assets/hero.png" alt="Finance DIP Banner" width="400" />
</p>

<p align="center">
  <strong>A modern full-stack web application for personal finance management, budget planning, and expense analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-Authentication-black?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Languages-AM%20%7C%20RU%20%7C%20EN-orange?style=flat-square" alt="Multilingual" />
</p>

---

## 📖 About The Project

**Finance DIP** is a full-stack personal finance web application (Diploma / Graduation Project) built to help users manage their income and expenses effortlessly. The application provides real-time transaction tracking across multiple currencies, visual expense breakdowns with interactive charts, monthly budget monitoring with overspending alerts, and one-click CSV report exports.

---

##  Key Features

-  **Multilingual Interface (3 Languages):**
  - Armenian (Հայերեն)
  - Russian (Русский)
  - English (English)
  - Seamless instant language switching with persistent user preferences stored in `localStorage`.

-  **Multi-Currency Support:**
  - Full support for **AMD (֏)**, **USD ($)**, **EUR (€)**, and **RUB (₽)**.
  - Independent current balance calculation for each currency.

-  **Interactive Visual Analytics:**
  - Expense breakdown by category using interactive **Recharts** pie charts.
  - Dynamic currency filter for analytics.

-  **Budget Limits & Alerts:**
  - Configurable monthly expense spending limit.
  - Automated visual warning badge (⚠️) when monthly expenses exceed the defined budget.

-  **Search and Filtering:**
  - Real-time search by transaction description.
  - Filter transactions by type (All, Income, Expense).
  - Filter by calendar month or view all-time history.

-  **CSV Export:**
  - Export filtered transaction history to `.csv`.
  - Encoded with **UTF-8 BOM** to guarantee correct rendering of Armenian and Cyrillic characters in Microsoft Excel.

-  **Secure Authentication:**
  - User registration and login flow.
  - Password hashing with **bcrypt** (10 salt rounds).
  - Secure **JSON Web Token (JWT)** issuance and verification with a 24-hour expiration window.

-  **Customizable User Profile:**
  - Select and update user avatars from an avatar collection.

---

##  Tech Stack

### Frontend (Client)
- **React 19** — Component-based UI library
- **Vite 8** — Fast build tool and modern dev server
- **React Router 7** — Client-side declarative routing
- **Recharts** — Interactive chart and data visualization library
- **Axios** — Promise-based HTTP client for API requests
- **Vanilla CSS** — Custom responsive design without heavy CSS frameworks

### Backend (Server)
- **Node.js** — JavaScript runtime environment
- **Express 5** — Minimalist web server framework and REST API
- **pg (node-postgres)** — PostgreSQL connection pool client
- **bcrypt** — Password hashing algorithm
- **jsonwebtoken (JWT)** — Secure authentication tokens
- **CORS** & **dotenv** — Cross-origin resource sharing & environment variable management
- **Nodemon** — Live reload development server

### Database
- **PostgreSQL** — Relational database for storing users, categories, and financial transactions

---

##  Project Structure

```text
diploma-app/
├── client/                      # React Frontend (Vite)
│   ├── public/                  # Static public assets (favicon, icons)
│   ├── src/
│   │   ├── assets/              # Images and graphics (hero banner, svgs)
│   │   ├── pages/               # Application views
│   │   │   ├── Dashboard.jsx    # Main dashboard (balances, charts, operations, CSV)
│   │   │   ├── Login.jsx        # Login page
│   │   │   └── Register.jsx     # User registration page
│   │   ├── App.jsx              # Navigation, routes, and language selector
│   │   ├── App.css
│   │   ├── index.css            # Global stylesheet
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js / Express Backend
│   ├── db.js                    # PostgreSQL pool connection (pg)
│   ├── index.js                 # REST API endpoints and static SPA serving
│   ├── schema.sql               # Database schema & initial category seed script
│   ├── .env.example             # Environment variables template
│   └── package.json
│
├── .gitignore                   # Git ignore file
└── README.md                    # Project documentation
```

---

##  Database Schema

The database consists of three relational tables:

1. **`users`** — User account records:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `email` (VARCHAR UNIQUE)
   - `password` (VARCHAR, bcrypt hashed)
   - `avatar` (TEXT)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

2. **`categories`** — Income and expense categories:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `type` (VARCHAR: `'income'` or `'expense'`)

3. **`transactions`** — Financial transactions:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (INTEGER, FK -> `users.id`)
   - `category_id` (INTEGER, FK -> `categories.id`)
   - `type` (VARCHAR: `'income'` or `'expense'`)
   - `amount` (NUMERIC(14, 2))
   - `currency` (VARCHAR: `'AMD'`, `'USD'`, `'EUR'`, `'RUB'`)
   - `description` (TEXT)
   - `date` (TIMESTAMP WITH TIME ZONE)

> [!TIP]
> A complete SQL script with table definitions and predefined category seeds is available in [`server/schema.sql`](file:///server/schema.sql).

---

##  Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Rest45/Finance_DIP.git
cd Finance_DIP
```

### 2. Set Up the PostgreSQL Database
Create a database in PostgreSQL (e.g., `finance_db`) and run the schema setup script:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE finance_db;"
psql -U postgres -d finance_db -f server/schema.sql
```

### 3. Configure and Start the Backend
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your PostgreSQL credentials:
   ```env
   PORT=5000
   JWT_SECRET=super_secret_jwt_key
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finance_db
   ```
5. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The server will start at: `http://localhost:5000`*

### 4. Configure and Start the Frontend
1. In a new terminal window, navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be available at: `http://localhost:5173`*

---

##  REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/test-db` | Tests PostgreSQL database connectivity |
| `POST` | `/users` | Registers a new user with hashed password |
| `POST` | `/login` | Authenticates user credentials and returns a JWT token |
| `PUT` | `/users/:id/avatar` | Updates the user's avatar image URL |
| `GET` | `/categories` | Fetches all income and expense categories |
| `GET` | `/transactions/:user_id` | Fetches all transactions for the specified user |
| `POST` | `/transactions` | Creates a new transaction (income / expense) |
| `DELETE` | `/transactions/:id` | Deletes a transaction by its ID |

---

##  Production Deployment

The Express server is configured to serve the production-built React frontend:

1. Build the frontend bundle:
   ```bash
   cd client
   npm run build
   ```
2. Start the production server from the `server` folder:
   ```bash
   cd ../server
   npm start
   ```
The full application (frontend UI + backend REST API) will run on a single port at `http://localhost:5000`.

---

##  Author

- **Ashot Restevanyan** — *Diploma / Graduation Project*
- GitHub: [@Rest45](https://github.com/Rest45)
- Email: `ashotrestevanyan38@gmail.com`

---

## 📄 License

This project is licensed under the [ISC](file:///server/package.json) License.
