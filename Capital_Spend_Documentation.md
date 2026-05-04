# Capital Spend - Financial Intelligence Dashboard 🚀🌗

Capital Spend is a high-fidelity, premium financial management application designed to give users total control over their capital through advanced analytics, budgeting tools, and an AI-powered financial assistant.

---

## 💎 Premium Features
- **Intelligent Dashboard**: Real-time analytics with dynamic charts that adapt to your spending habits.
- **AI Financial Assistant**: Integrated with Google Gemini to provide personalized financial advice and spending insights.
- **Executive PDF Export**: Professional, branded financial statements with zebra-striped tables and budget analytics.
- **Smart Budgeting**: Set monthly limits and get real-time feedback on your remaining balance.
- **Premium Glassmorphism UI**: A state-of-the-art interface featuring:
    - Custom Dark/Light modes.
    - Frosted glass components with deep shadows.
    - High-fidelity animations and global cursor optimizations.
- **Transaction History**: Comprehensive CRUD management for all your expenses with category-based filtering.

---

## 🛠️ Tech Stack
### Frontend
- **React.js**: Core framework for a reactive UI.
- **TailwindCSS**: For advanced, premium styling and glassmorphism.
- **Lucide-React**: Modern, crisp iconography.
- **Recharts**: For dynamic, theme-aware data visualizations.
- **Axios**: For seamless API communication.

### Backend
- **Node.js & Express**: High-performance server architecture.
- **MongoDB & Mongoose**: Scalable NoSQL database with robust schema validation.
- **JWT (JSON Web Tokens)**: Secure, stateless authentication.
- **PDFKit**: For generating professional, executive-level financial reports.
- **Google Gemini API**: Powering the AI Financial Intelligence Assistant.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 📂 Project Structure
```text
Capital Spend/
├── backend/
│   ├── config/         # DB Connection
│   ├── controllers/    # Business logic (Expenses, Budget, Chat)
│   ├── middleware/     # Auth & Error handling
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   └── utils/          # PDF Generation & AI logic
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Auth & Theme state
    │   ├── pages/      # Login, Signup, Dashboard, Budget
    │   └── services/   # API Service layer
```

---

## 📜 Professional PDF Statement
The exported PDF includes:
- **Branded Executive Header**: User details and report metadata.
- **Analytics Cards**: Monthly Budget, Total Spent, and Remaining Balance.
- **Formatted Data**: Zebra-striped transaction history for maximum readability.
- **Global Symbols**: Standardized INR rendering for cross-platform compatibility.

---

## 🎨 UI/UX Philosophy
- **Non-Selectable UI**: Decorative text and headings are protected from selection to feel like a native app.
- **Pointer Precision**: Every interactive element explicitly uses a pointer cursor for a high-end feel.
- **Responsive Mastery**: Designed for desktop productivity while remaining fully functional on mobile devices.

---

**Capital Spend - Transform your spending into intelligence.**
