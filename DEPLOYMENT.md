# Deployment Guide

The project is **10000x ready** for deployment on Vercel (Frontend) and Render (Backend). Here is a step-by-step checklist to get it live.

---

## 1. Deploy the Backend to Render

Your backend uses standard Node.js practices, listens on `process.env.PORT`, and has a proper start script (`node server.js`). 

1. Go to your [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
2. Connect this GitHub repository.
3. Configure the following settings for the backend folder:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables**: Add these in the Render dashboard:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>` (Crucial: replace with your actual Atlas string)
   - `JWT_SECRET`: `<A strong random string>`
   - `ALLOWED_ORIGINS`: `<Leave this blank for now, we will add the Vercel URL here once the frontend is deployed>`

Deploy the backend. Once it is live, Render will give you a URL (e.g., `https://crypto-analytics-api.onrender.com`). Copy this URL.

---

## 2. Deploy the Frontend to Vercel

The frontend uses Vite and React Router. I have just added a `vercel.json` file to ensure that Vercel properly handles React Router page refreshes without throwing 404 errors!

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import this GitHub repository.
3. Configure the following settings for the frontend folder:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables**: Add this critical variable so your frontend talks to your newly deployed backend:
   - `VITE_API_URL`: `<Your Render Backend URL from Step 1>` (e.g., `https://crypto-analytics-api.onrender.com`)

Deploy the frontend. Once it is live, Vercel will give you a URL (e.g., `https://crypto-frontend.vercel.app`).

---

## 3. Final Security Step (CORS)

Now that you have your Vercel URL, go back to your **Render Backend Environment Variables** and update `ALLOWED_ORIGINS`:

- `ALLOWED_ORIGINS`: `<Your Vercel URL>` (e.g., `https://crypto-frontend.vercel.app`)

Save the changes. Render will automatically redeploy the backend. Once that's done, your full-stack application will be securely communicating and live on the internet!
