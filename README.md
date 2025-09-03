# Cognify Frontend

Cognify is a modern web platform designed to help learners master programming through interactive coding challenges, structured learning paths, and progress tracking. This repository contains the **frontend application** — the user-facing interface that connects to the Cognify backend API.

The frontend is built with **JavaScript, HTML, and CSS**, and is designed for seamless integration with the Cognify backend.

---

## 🚀 Project Overview

The Cognify frontend provides an intuitive and engaging experience for learners, featuring:

* **User Authentication:** Secure registration, login, and role-based access.
* **Programs & Courses:** Browse, enroll, and navigate through structured learning programs, courses, and lessons.
* **Progress Tracking:** Visual indicators and dashboards to monitor your advancement.
* **Coding Challenges:** Interactive challenge pages with real-time code editing, submission, and instant feedback.
* **Responsive Design:** Fully responsive interface for desktop and mobile devices.
* **AI Chat:** Improve your coding skills with an AI chat.
* **Terminal:** Built in terminal to code without the need of local resources.

---

---

## 🏗️ Architecture

* **Frontend:** Vanilla JavaScript, HTML5, CSS3
* **State Management:** Local storage and in-memory state
* **API Integration:** RESTFUL API calls Cognify backend
* **Routing:** Client-side navigation for a seamless SPA experience

```text
+----------------+         REST API         +----------------+
|  Frontend      |  <-------------------->  |    Backend     |
| (JS + HTML +   |                         | (Node + Exp.)  |
|   CSS)         |                         |                |
+----------------+                         +----------------+
```

---

## 🛠️ Tech Stack

**Core Technologies:**

* JavaScript (ES6+)
* HTML5
* CSS3 (with modular structure)
* npm (for dependency management and scripts)
* Local storage for state management

**Dependencies & Dev Tools:**

* **Vite** (Development server, build, preview)
* **gh-pages** (Deployment to GitHub Pages)
* **Axios** (API requests)
* **Marked** (Markdown rendering)
* **PrismJS** (Code syntax highlighting)
* **SweetAlert2** (Alerts and modals)

**External Resources:**

* TailwindCSS: `<script src="https://cdn.tailwindcss.com"></script>`
* Font Awesome: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">`

---

## ✅ Requirements

Before running the frontend locally, ensure you have:

* Node.js (v18 or higher recommended)
* npm (comes with Node.js)
* Access to the Cognify backend API (running locally or deployed)

---

## ⚙️ Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/Cognify1/Frontend-Cognify.git
cd Frontend-Cognify
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory (if required) to set the backend API URL:

```text
VITE_API_URL=https://backend-cognify.com/api
```

Adjust the variable name and value according to your setup.

4. **Run the development server**

```bash
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173) (Vite default port)

---

## 📂 Project Structure

```text
Frontend-Cognify/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   ├── pages/             # Main pages (Home, Programs, Challenges, Resources, AI Chat)
│   ├── services/          # API calls and utilities
│   ├── styles/            # CSS files
│   ├── utils/             # Helper functions
│   └── index.js           # App entry point
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
└── README.md
```

---

## 🌐 Deployment

The frontend can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

**Example: Deploy to GitHub Pages with Vite**

```bash
npm run build
npm run deploy
```

---

## 🧑‍💻 Main Features

* **Home Page:** Welcome users and provide quick access to programs and challenges.
* **Programs & Courses:** Browse all available programs, view course details, and enroll.
* **Challenges Page:** Solve coding challenges with an interactive code editor and real-time feedback.
* **AI Chat:** Interact with an AI Chat with GPT-3.5.
* **Responsive Navigation:** Easy navigation across all devices.
* **Terminal:** Built in terminal to code in the app.

---

## 🔗 API Integration

All data is fetched from the Cognify backend API.
Update the API base URL in your environment variables as needed.

---

## 👥 Team
Cognify was developed by a team of five dedicated members:
- Juan Camilo Villa
- Juan Pablo Rico
- Kaled Mesa
- Andrés Bolaños
- Carlos Arturo Rojas

---

## ⚠️ License
This project does not currently have a license and is intended for academic and internal use only.