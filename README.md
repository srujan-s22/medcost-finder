# MedCost Finder 💊

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Ollama](https://img.shields.io/badge/AI-Ollama%20(Llama3)-orange)


**MedCost Finder** is a full-stack web application designed to help users in India discover affordable generic alternatives to branded medicines. By taking a list of medicines, the app connects to a local, offline AI model to estimate pricing, compare generic versus branded costs, outline yearly savings, and provide detailed medical information (uses, side effects). It also points users to nearby Jan Aushadhi stores via an integrated map.

---

## ✨ Features

- **AI-Powered Medicine Analysis:** Leverages a local Ollama instance running Llama 3 to generate structured, intelligent estimates of generic and brand medicine prices.
- **Price Comparison & Savings Calculator:** Calculates potential monthly and yearly savings automatically when switching to generic formulations.
- **Detailed Medical Context:** Displays uses, common side effects, dosage forms, and popular Indian brand names.
- **Nearby Pharmacy Locator:** Enter a location to immediately visualize nearby Jan Aushadhi (affordable generic medicine) stores using an embedded Google Maps iframe.
- **Robust Fallback Mechanism:** Includes fallback logic ensuring the app never crashes, returning safe estimated baseline prices if the AI service temporarily goes down.
- **Modern UI/UX:** Built with React 19 and Tailwind CSS 4 for a visually clean, responsive layout.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS (v4)
- **Tooling:** ESLint, PostCSS

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **AI Integration:** Integration with local Ollama API (`llama3`)

---

## 📂 Project Structure

```text
MedCost-Finder/
├── backend/
│   ├── index.js             # Main Express server and Ollama integration
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables (backend)
└── frontend/
    ├── src/
    │   ├── App.jsx          # Main React application component
    │   ├── main.jsx         # React DOM entry point
    │   └── index.css        # Tailwind directives and CSS
    ├── vite.config.js       # Vite bundler configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    └── package.json         # Frontend dependencies
```

---

## 🚀 Installation & Setup

Before starting, ensure you have **Node.js** and **Ollama** installed on your system.

### 1. Set up the AI Model (Ollama)
The backend expects a local instance of Ollama running the `llama3` model.
```bash
# If you don't have llama3 installed in Ollama, pull and run it:
ollama run llama3
```
*Keep Ollama running in the background.*

### 2. Set up the Backend
Open a new terminal window:
```bash
cd backend
npm install
```

### 3. Set up the Frontend
Open another terminal window:
```bash
cd frontend
npm install
```

---

## 🔐 Environment Variables

If needed, create a `.env` file in the `backend/` directory.

```env
# backend/.env - Example
PORT=3000
```
*(The application works flawlessly on default ports without environment variables, but establishing a `.env` file is recommended for custom port setups.)*

---

## 💻 How to Run Locally

To run the application, you need to start both the backend and frontend development servers.

### Start the Backend
```bash
cd backend
node index.js
```
*(Runs on `http://localhost:3000`)*

### Start the Frontend
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173` typically)*

Open the provided Vite localhost URL in your browser to start using the app.

---

## 📦 Build for Production

If you wish to deploy the frontend:
```bash
cd frontend
npm run build
```
This command bundles the React application into the `dist/` folder, ready to be served statically.

---

## 🗺️ Roadmap / Future Improvements

- [ ] **Live Price API:** Transition from AI-estimated pricing to consuming a real-world pharmaceutical pricing API (e.g., 1mg, Pharmeasy APIs).
- [ ] **User Accounts:** Allow users to save prescriptions, track their local stores, and monitor medication schedules.
- [ ] **Dockerization:** Wrap the application and the Ollama instance in a `docker-compose.yml` for unified, 1-click execution.

---

## 🤝 Contact / Author

Developed by **Srujan**.
Feel free to open issues or submit pull requests if you want to contribute!
