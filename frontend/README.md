# Opportunity DNA - Frontend Setup Guide

The frontend is a React + Vite + TypeScript web application styled with Tailwind CSS (v3).

## Prerequisites
- Node.js 18 or higher (We detected version 24.16.0 is installed)

## Setup Instructions

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Customize the API URL if necessary. By default, it maps to `http://localhost:8000/api`.

---

## Running the Application

To start the Vite local development server, run:

```bash
# From the frontend directory (Oppurtunity_DNA/frontend/)
npm run dev
```

By default, the application will boot on [http://localhost:5173](http://localhost:5173).

Once loaded:
1. Trigger the **Seed System Data** button on the dashboard to populate mock data.
2. Select candidate profiles, inspect skills, and click **Sync GitHub Repos** to import evidence repository details.
3. Select candidates and job opportunities, and run **Matching & Bias Auditing** evaluations.
