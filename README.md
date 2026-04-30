# TaskFlow - Team Task Manager

A full-stack team task management application with role-based access control.

## 🚀 Features
- **Authentication**: Secure Signup/Login with JWT.
- **Dashboard**: Overview of tasks, projects, and recent activity.
- **Project Management**: Create and manage projects with team members.
- **Task Tracking**: Assign tasks, set priorities, and update status.
- **RBAC**: Admin/Member roles for granular control.

## ⚙️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Better-SQLite3, JWT, Express-Validator.
- **Database**: SQLite (SQL).

## 🛠️ Local Setup

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:3001`*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (or next available port)*

## 🌐 Deployment (Railway)

This project is ready for Railway deployment. 

1. **Backend**:
   - Set Root Directory to `backend`.
   - Add environment variables: `JWT_SECRET`, `PORT=3001`.
2. **Frontend**:
   - Set Root Directory to `frontend`.
   - Add environment variable: `VITE_API_URL=your-backend-url/api`.
   - Build Command: `npm run build`.
   - Start Command: `npm run preview` or serve the `dist` folder.
