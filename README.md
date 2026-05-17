# Enterprise Watch & Earn Platform

A production-ready Telegram Mini App (TMA) built with NestJS, Next.js, and PostgreSQL.

## 🚀 Deployment Guide (Cloud)

### 1. Database (Supabase)
1. Create a project on [Supabase](https://supabase.com).
2. Go to **Project Settings > Database** and copy the **Connection string** (URI).
3. Use this string as your `DATABASE_URL` in the backend environment variables.
   - *Note: Ensure you use the "Transaction" mode (Port 6543) if using connection pooling.*

### 2. Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime.
4. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: A long random string.
   - `TELEGRAM_BOT_TOKEN`: Your token from @BotFather.
   - `PORT`: 3001
5. Render will automatically build the `backend/Dockerfile`.

### 3. Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The URL of your Render backend (e.g., `https://your-backend.onrender.com/api`).
5. Deploy.

### 4. Monetag Integration
1. Go to [Monetag Publishers](https://publishers.monetag.com).
2. Create a **Rewarded Ads** zone.
3. Copy the script provided and place it in `frontend/src/app/layout.tsx` inside the `<head>` tag.
4. Update the `ZONE_ID` in `frontend/src/app/page.tsx` if you implement a custom ad trigger.

## 🛠️ Local Development
1. Clone the repo.
2. Run `docker-compose up` in the root directory.
3. Backend: `http://localhost:3001`
4. Frontend: `http://localhost:3000`

## 🛡️ Anti-Fraud Measures
- **Backend Validation**: All rewards are calculated and validated on the backend.
- **Cooldowns**: 5-second forced delay between ads.
- **Daily Limits**: Max 20 ads per day per user.
- **Manual Withdrawals**: Admin approval flow for all payouts.
