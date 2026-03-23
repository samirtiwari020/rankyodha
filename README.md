# ⚔️ RankYodha: AI-Powered Adaptive Learning Companion

**RankYodha** is a state-of-the-art learning platform designed for high-stakes competitive exams like **JEE, NEET, and UPSC**. It leverages the **SM-2 Spaced Repetition Algorithm** and **Gemini 2.0 AI** to provide students with a mathematically optimized study schedule and personalized analytics.

---

## 🚀 Key Features

### 📊 Dynamic Analytics Dashboard
*   **Revision Load Heatmap**: A 7-day visual tracker of study consistency.
*   **Adaptive Progress Arc**: Real-time calculation of "Today's Goal" vs. "Completed Tasks".
*   **Performance Metrics**: Subject-wise accuracy and memory retention forecasts.

### 🧠 Spaced Repetition System (SRS)
*   **SM-2 Algorithm**: Automatically schedules reviews based on recall confidence (0-5).
*   **Smart Categorization**: Separation of topics into *Due Now*, *Learning*, and *Mastered*.

### 🤖 AI Tutor & Doubt Solver
*   **Gemini 2.0 Integration**: Ask complex questions directly to an AI tutor trained on exam patterns.
*   **Conceptual Insights**: AI-generated tips and memory hacks for difficult topics.

### 🎨 Premium User Experience
*   **Dynamic Theming**: Full support for Dark and Light modes with an elegant, responsive UI.
*   **Global Notifications**: Real-time alerts for upcoming tests and urgent revision reminders.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Components**: [Shadcn UI](https://ui.shadcn.com/)

### **Backend**
*   **Environment**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
*   **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & Bcrypt
*   **AI Engine**: [Google Generative AI (Gemini SDK)](https://ai.google.dev/)

---

## ⚙️ Installation & Setup

### **1. Prerequisites**
*   Node.js (v18 or higher)
*   NPM or Yarn
*   A MongoDB Atlas Connection String
*   A Google Gemini API Key

### **2. Clone the Repository**
```bash
git clone <your-repo-link>
cd rankyodha
```

### **3. Backend Configuration**
Navigate to the `Backend` directory and create a `.env` file:
```bash
cd Backend
# Add the following variables to .env:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_ai_key
```
**Install dependencies:**
```bash
npm install
```

### **4. Frontend Configuration**
Navigate to the `Frontend` directory and install dependencies:
```bash
cd ../Frontend
npm install
```

---

## 🏃 Project Execution

Open two terminal windows to run both servers simultaneously.

### **Run Backend**
```bash
cd Backend
npm run dev
```

### **Run Frontend**
```bash
cd Frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📸 Presentation Mode
The project includes a **presentation override** on the Dashboard. If the database is empty, the UI will automatically populate with aesthetic data (25% completion arc and a 7-day activity graph) to demonstrate the logic to stakeholders and judges.

---

## ✨ Authors
*   **Samir & Team** - *Hackathon Project*

---
*Built for the next generation of top-rankers.*
