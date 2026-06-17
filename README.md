# Target User Directory Application

This application simulates a professional networking platform similar to LinkedIn. It represents the target system and exposes public API endpoints designed to serve profile information openly, allowing developers to study how data scraping occurs and how to implement anti-scraping defenses.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, React Query, Axios
- **Backend**: Python FastAPI, Uvicorn
- **Database**: MongoDB (Local or Atlas)
- **Data Generation**: Faker, Motor (Async MongoDB client)

## Folder Structure

```text
user-directory-app/
├── backend/
│   ├── main.py                    # FastAPI Backend Application Server
│   ├── requirements.txt           # Python Dependencies
│   └── scripts/
│       └── generate_users.py      # Database Seeding Script (100 fake profiles)
└── frontend/
    ├── app/                       # Next.js App Router Pages
    ├── public/                    # Static Assets
    ├── package.json               # NPM Dependencies
    └── tsconfig.json              # TypeScript Configuration
```

## Setup & Running Instructions

### 1. Database Configuration
Ensure a local MongoDB server is active on your system (listening on default port `27017`), or retrieve your MongoDB Atlas Connection String.

Create a `.env` file in `backend/` or set variables globally:
```env
MONGODB_URI=mongodb://localhost:27017
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with exactly 100 fake profiles (ensuring MongoDB is running first):
   ```bash
   python scripts/generate_users.py
   ```
5. Start the FastAPI server on port `8000`:
   ```bash
   python main.py
   ```
   The backend API will run at: `http://localhost:8000`

### 3. Frontend Setup
1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Create a local environment variables file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Install node packages:
   ```bash
   npm install
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will run at: `http://localhost:3000`

---

## API Documentation (Publicly Exposed Endpoints)

### 1. Directory Brief List
Returns a lightweight list of all registered profile records.
- **Endpoint**: `GET /api/users`
- **Output Schema**:
  ```json
  [
    {
      "id": "user_001",
      "name": "John Doe",
      "company": "Google"
    }
  ]
  ```

### 2. Profile Details Query
Returns complete details for a single professional profile. Hits to this API log profile views for audit graphs.
- **Endpoint**: `GET /api/users/{id}`
- **Output Schema**:
  ```json
  {
    "id": "user_001",
    "name": "John Doe",
    "headline": "Senior Software Architect at Google",
    "jobTitle": "Senior Software Architect",
    "company": "Google",
    "email": "johndoe@google.com",
    "phone": "+1-555-0199",
    "location": "Mountain View, USA",
    "education": "B.S. in Computer Science, University of California",
    "experienceYears": 12,
    "skills": ["Python", "Docker", "AWS", "Kubernetes"],
    "profileImage": "https://randomuser.me/api/portraits/men/1.jpg",
    "createdAt": "2026-06-17T12:00:00Z"
  }
  ```

### 3. Protection Toggle (Defense Mode Control)
Enables or disables anti-scraping defenses on the server (Rate Limiting & Bot Detection).
- **Endpoint**: `POST /api/protection`
- **Payload**: `{"enabled": true}` / `{"enabled": false}`

---

## Deployment Configuration

### Frontend (Vercel)
Deploy your frontend instantly by importing the repository folder into Vercel and injecting environment variables:
1. Target: `user-directory-app/frontend`
2. Framework Preset: `Next.js`
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: (Your deployed backend API root URL)

### Backend (Render)
Deploy your FastAPI server to Render:
1. Target: Web Service pointing to `user-directory-app/backend`
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `MONGODB_URI`: (Your MongoDB Atlas connection URI string)
