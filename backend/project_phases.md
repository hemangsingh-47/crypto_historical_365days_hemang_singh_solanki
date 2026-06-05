# Crypto Market Analytics API - Development Phases

This checklist tracks the implementation of the backend codebase, divided into **27 distinct parts** to enable incremental commits and testing.

---

## Roadmap Tracker

- [x] **Phase 1: Project Setup (Folder Structure, README.md, Phase Plan)**
- [x] **Phase 2: Express Server & Initial Configurations (npm init, Express, dotenv, server.js)**
- [x] **Phase 3: MongoDB Connection & Mongoose Config (config/db.js, error handling)**
- [x] **Phase 4: Data Modeling & Schema Design (Mongoose Schema with validations, Indexes)**
- [x] **Phase 5: Database Seeding Script (Script to parse JSON dataset and ingest into MongoDB)**
- [x] **Phase 6: Basic CRUD Routes - Fetching & Creation (GET /coins, GET /coins/:id, POST /coins)**
- [x] **Phase 7: Basic CRUD Routes - Replacement & Updates (PUT /coins/:id, PATCH /coins/:id, DELETE /coins/:id)**
- [x] **Phase 8: Bulk Operations & Record Checking (GET /coins/exists/:id, POST /coins/bulk-create, PATCH /coins/bulk-update, DELETE /coins/bulk-delete)**
- [x] **Phase 9: Coin Info Routes - Identity Filters (GET /coins/name/:coinName, GET /coins/symbol/:symbol, GET /coins/rank/:rank)**
- [x] **Phase 10: Coin Info Routes - Time Filters (GET /coins/month/:month, GET /coins/date/:date, GET /coins/latest, GET /coins/history/:coinId)**
- [x] **Phase 11: Top Performers & Market Standings (GET /coins/top-market-cap, GET /coins/top-volume, GET /coins/top-gainers, GET /coins/top-losers)**
- [x] **Phase 12: Chronological Routes (GET /coins/oldest, GET /coins/newest, GET /coins/trending, GET /coins/recent)**
- [x] **Phase 13: Analytical Route Parameters (GET /coins/performance/:coinId, volatility, market-cap, volume, returns)**
- [x] **Phase 14: Coin Comparison & Pricing (GET /coins/compare/:coin1/:coin2, comparison of 3 coins, current price, monthly history)**
- [x] **Phase 15: Query Parameters - Filtering, Sorting & Pagination (GET /coins with query parameters)**
- [x] **Phase 16: Dedicated Pagination & Sorting Endpoints (GET /coins/sort/* and paginated lists)**
- [x] **Phase 17: Search Routes (Regex-based search endpoints: /search/coins?q=...)**
- [x] **Phase 18: Custom Filtering Endpoints (/coins/filter/high-price, low-price, bullish, bearish, profitable, loss-making, etc.)**
- [x] **Phase 19: Aggregation Analytics (Match, group, project, sort pipelines for highest/lowest/average price & volume)**
- [x] **Phase 20: Aggregation Statistics (Market capitalization, distribution graphs calculations, daily/monthly/yearly summary)**
- [x] **Phase 21: Auth System - User Registration & Email Verification (POST /auth/register, POST /auth/verify-email, User model)**
- [x] **Phase 22: Auth System - User Login, Logout & Profile Management (POST /auth/login, POST /auth/logout, profile routes)**
- [x] **Phase 23: Password Management (POST /auth/forgot-password, reset-password, change-password)**
- [ ] **Phase 24: JWT Security & Token Refreshing (JWT verification middleware, protected routes, refresh/revoke tokens)**
- [ ] **Phase 25: Custom Middlewares & Security Enhancements (Logger, custom Rate Limiter, CORS settings)**
- [ ] **Phase 26: Error Handling & Input Validation (Global error middleware, request validation schemas, health checks, advanced prediction/simulations)**
- [ ] **Phase 27: HTTP HEAD & OPTIONS Methods & Postman Export**

---

### Phase Guidelines

1. **Incremental Commits**: Please commit the changes for each phase immediately after its completion.
2. **Review & Approval**: Before starting a new phase, a fresh implementation plan will be proposed to outline the changes for your approval.
3. **Verification**: Each phase will undergo strict manual or automated validation before being marked as completed.
