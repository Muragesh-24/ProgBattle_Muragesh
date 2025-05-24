# ProgBattle  
A Full-Stack Competitive Programming Matchmaking Platform  
**Task submission for Programming Club Secretary Selection – IIT Kanpur**

**Live Website**: [Visit ProgBattle](https://prog-battale-frontend.vercel.app/)  
*Best viewed on desktop*

---

##  Repositories

- **Frontend**: [GitHub Link](https://github.com/Muragesh-24/ProgBattale_frontend) (React, PWA, Vercel)  
- **Backend**: [GitHub Link](https://github.com/Muragesh-24/ProgBattle_Muragesh) (Express.js, Render)

---

##  Tech Stack

- **Frontend**: React.js (with PWA support)  
- **Backend**: Node.js, Express.js
- **Supported Email Verification** 
- **Database**: MongoDB  
- **Hosting Platforms**:  
  - Frontend: [Vercel](https://vercel.com)  
  - Backend: [Render](https://render.com)

---

##  How to Run Locally

### 1. Clone the Repositories

```bash
git clone https://github.com/Muragesh-24/ProgBattale_frontend
git clone https://github.com/Muragesh-24/ProgBattle_Muragesh
```

### 2. Set Up Backend

```bash
cd ProgBattle_Muragesh
npm install
```

Create a `.env` file and add the following:

```ini
MONGO_URI=<your-mongo-db-uri>
JWT_SECRET=<your-secret-key>
pass=<your gmail app password>
```

Start the backend:

```bash
npm start
```

### 3. Set Up Frontend

```bash
cd ../ProgBattale_frontend
npm install
```

Update API URLs in frontend code if needed (e.g., change to `http://localhost:5000` for local testing):

```bash
npm start
```

---

##  Known Issues & Improvements

- **Admin Route Protection**: 401 error in production (temporarily disabled)
- **Replay Feature Broken**: `game_log` not reaching client
- **Mobile Responsiveness**: Not optimized yet
- **Slow Login**: Delay (~10s) on Render, fast locally
- **Dockerization**: Not implemented due to setup issues

---

##  Round 2 – Admin Controlled

- Admin redeploys the website to start Round 2
- 16 knockout matches handled manually by the admin

---

##  API Testing with Postman

Base URL:

```bash
https://progbattle-muragesh.onrender.com
```

---

###  Authentication

#### `POST /login`

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

#### `POST /Adminlogin`

```json
{
  "sentence": "admin_phrase",
  "password": "admin_password"
}
```

---

###  Code Evaluation

#### `POST /evaluate-all`  
→ Evaluate all pending submissions

#### `POST /save-python`

```json
{
  "code": "print('Hello World')",
  "teamid": "team123"
}
```

---

###  Team Operations

#### `GET /teams/my-teams`

**Headers:**

```makefile
Authorization: Bearer <your_jwt_token>
```

#### `GET /:teamId`

**Headers:**

```makefile
Authorization: Bearer <your_jwt_token>
```

#### `POST /teams/create`

```json
{
  "name": "Team Avengers",
  "leaderEmail": "leader@example.com",
  "memberEmails": ["mem1@example.com", "mem2@example.com"]
}
```

#### `GET /alllteams`  
→ Get all teams (admin access)

---

##  Demo / Live Preview

_(https://www.youtube.com/watch?v=owarvrrjjxM)._

---
