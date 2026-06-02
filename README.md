# 🪙 Crypto Historical 365 Days Analytics API

A robust, high-performance cryptocurrency historical data tracking and analysis platform built on the **MERN (MongoDB, Express.js, React, Node.js) stack**. This API provides comprehensive endpoints for single and bulk CRUD operations, advanced historical data filtering (by identity, date, month, and rank), and market performance metrics.

---

## 🚀 Key Features

*   **Standard MVC Architecture**: Clean code organization separated into Models, Controllers, Services, and Routes.
*   **High-Performance Bulk Operations**: Optimized database operations utilizing MongoDB's native `insertMany`, `bulkWrite`, and `deleteMany`.
*   **Rich Querying and Filtering**: Query by coin name, symbol, rank, month, or specific calendar date.
*   **Time-Series Insights**: Retrieve comprehensive historical prices, daily returns, rolling moving averages (7-day and 30-day), volatility metrics, and cumulative returns.
*   **Intelligent Route Matching**: Carefully structured route hierarchy preventing parameter conflicts (e.g., matching static/bulk routes before dynamic parameters like `/:id`).
*   **Robust Data Types & Sanitization**: Custom handlers (like MongoDB `$expr`) to perfectly reconcile string/numeric types during queries.

---

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB Atlas (Cloud)
*   **Object Modeling**: Mongoose
*   **Configuration**: Dotenv
*   **CORS Support**: Enforced CORS cross-origin safety configurations.

---

## 📂 Project Directory Structure

```text
├── backend/
│   ├── config/             # Database connection setups
│   │   └── db.js
│   ├── controllers/        # Request handling and response generation
│   │   └── coinController.js
│   ├── models/             # Mongoose Schemas & Data modeling
│   │   └── Coin.js
│   ├── routes/             # RESTful API route mapping
│   │   └── coinRoutes.js
│   ├── services/           # DB query abstractions & business logic
│   │   └── coinService.js
│   ├── .env                # App configuration & environment keys
│   ├── project_phases.md   # Feature roadmap and tracker
│   └── server.js           # Server initializer and middleware pipeline
├── README.md               # API Documentation and setup guide
```

---

## ⚙️ Installation & Configuration

### 1. Prerequisites
Ensure you have Node.js (v16+) and npm installed on your system.

### 2. Set Up Environment Variables
Create a file named `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crypto
```

### 3. Install Dependencies
Navigate to the `backend/` folder and run:
```bash
npm install
```

### 4. Run the API Locally
Start the server in development mode with hot-reloading:
```bash
npm run dev
```

---

## 📖 API Documentation & Route Reference

All routes are prefixed with `/coins`.

### 1. Standard CRUD Endpoints
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins` | Fetch all historical records (default: 50 per page). Supports `?page=X&limit=Y` |
| **GET** | `/coins/:id` | Retrieve a specific historical record by MongoDB `_id` |
| **POST** | `/coins` | Create a single cryptocurrency record |
| **PUT** | `/coins/:id` | Replace an existing coin record |
| **PATCH** | `/coins/:id` | Partially update an existing coin record |
| **DELETE** | `/coins/:id` | Remove a coin record by its MongoDB ID |

### 2. Bulk & Existence Operations
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/exists/:id` | Quick boolean check to see if a record exists |
| **POST** | `/coins/bulk-create` | Inserts an array of coin objects in one DB trip |
| **PATCH** | `/coins/bulk-update` | Updates multiple records using `bulkWrite` containing `{ id, updateData }` |
| **DELETE** | `/coins/bulk-delete` | Deletes multiple records via an array of MongoDB IDs |

### 3. Identity-Based Filters
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/name/:coinName` | Fetch records by coin name (case-insensitive regex search) |
| **GET** | `/coins/symbol/:symbol` | Fetch records by symbol (auto-uppercased) |
| **GET** | `/coins/rank/:rank` | Fetch records by market cap rank (supports string/number types in DB) |

### 4. Time-Based & History Filters
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/month/:month` | Fetch records within a specific month (format: `YYYY-MM`) |
| **GET** | `/coins/date/:date` | Fetch records matching a specific date (format: `YYYY-MM-DD`) |
| **GET** | `/coins/latest` | Fetch the latest single record for each unique coin, sorted by market cap |
| **GET** | `/coins/history/:coinId` | Fetch full chronological price history for a specific coin by `coin_id` |

### 5. Market Standings & Top Performers
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/top-market-cap` | Fetch latest coin records sorted by market capitalization descending |
| **GET** | `/coins/top-volume` | Fetch latest coin records sorted by 24h trading volume descending |
| **GET** | `/coins/top-gainers` | Fetch latest coin records sorted by daily return percentage descending |
| **GET** | `/coins/top-losers` | Fetch latest coin records sorted by daily return percentage ascending |

### 6. Chronological & Extrema Filters
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/oldest` | Fetch all historical records in order of timestamp ascending (earliest first) |
| **GET** | `/coins/newest` | Fetch all historical records in order of timestamp descending (latest first) |
| **GET** | `/coins/trending` | Fetch latest coin records sorted by 24h trading volume descending |
| **GET** | `/coins/recent` | Fetch all historical records in order of timestamp descending (synonymous to newest) |

### 7. Analytical & Performance Metrics
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/coins/performance/:coinId` | Fetch analytical performance dashboard (averages, volatility, extrema, returns) for a specific coin |


---

## 🧪 Testing with PowerShell / cURL

### Fetch Latest Coins (Mkt Cap Sorted)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/coins/latest?limit=5" -Method GET
```

### Search by Symbol (e.g. BTC)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/coins/symbol/btc" -Method GET
```

### Fetch Month Records
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/coins/month/2025-12" -Method GET
```

### Fetch Top Gainers (Standings)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/coins/top-gainers?limit=3" -Method GET
```

### Fetch Oldest Coin Logs
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/coins/oldest?limit=1" -Method GET
```

### Fetch Coin Performance Analytics (Phases 13)
```powershell
# Full dashboard
Invoke-RestMethod -Uri "http://localhost:5000/coins/performance/bitcoin" -Method GET

# Single metric query
Invoke-RestMethod -Uri "http://localhost:5000/coins/performance/bitcoin?metric=volatility" -Method GET
```
