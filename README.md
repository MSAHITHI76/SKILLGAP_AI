# 🚀 SkillGap AI-Powered Skill Gap Identification & Recommendation System

### Bridge the Gap to Your Dream Job

SkillBridge AI is an AI-powered platform that analyzes resumes and compares them with job descriptions to identify skill gaps and improve hiring chances.

---

## ✨ Features

- 📄 Upload resume and extract skills  
- 🔍 Analyze job description requirements  
- 📊 Compare skills and calculate match score  
- ❌ Identify missing skills  
- 🎓 Recommend relevant courses & certifications  
- 🤖 AI chatbot for career guidance  

---

## 🛠 Technologies Used

### 🌐 Frontend
- **HTML / CSS / JavaScript** – Core web technologies for UI and interactions  
- **Progress Bars & Animations** – Vanilla JavaScript for dynamic visual feedback  
- **Drag & Drop / File Upload** – `resumeUpload.js` for handling resume uploads  

---

### ⚙️ Backend
- **Node.js** – JavaScript runtime for server-side logic  
- **Express.js** – Web framework for APIs and routing  
- **CORS** – Cross-Origin Resource Sharing for secure API calls  
- **dotenv** – Manage environment variables  
- **Nodemon** – Development tool to auto-restart server during development  

---

###  AI / NLP
- **Resume Parsing** – PDF, DOCX, and TXT text extraction  
- **Skill Detection** – NLP-based comparison between resume skills and job requirements  
- **AI Chatbot** – Career guidance and skill improvement suggestions

## 📂 Project Structure
```
skill-gap-analyzer/
├─ index.html               ← Main app (open this)  
├─ manifest.json            ← PWA manifest  
├─ favicon.png              ← App icon  
├─ package.json  

├─ css/  
│   ├─ vendors.css          ← Reset styles  
│   └─ main.css             ← Full app design  

├─ js/  
│   ├─ skillDatabase.js     ← All skills, jobs, courses, chatbot KB  
│   ├─ app.js               ← Main orchestrator  
│   ├─ resumeUpload.js      ← Drag & drop + validation  
│   ├─ resumeParser.js      ← PDF/DOCX/TXT text extraction  
│   ├─ skillAnalysis.js     ← NLP skill detector  
│   ├─ jobMatching.js       ← Match scoring engine  
│   ├─ recommendations.js   ← Course recommender  
│   ├─ chatbot.js           ← AI career guide  
│   └─ progressBar.js       ← Animated progress bars  

├─ backend/                 ← Optional Node.js backend  
│   ├─ server.js  
│   ├─ routes/  
│   └─ utils/  

├─ config/  
│   └─ frontend-config.js   ← App configuration  

└─ assets/  
    └─ logo_v3.png
```

## Installation and Run

### 1. Clone the repository (or download the project files)
```
git clone  https://github.com/MSAHITHI76/SKILLGAP_AI.git
cd SkillGap-AI
```
### 2. Install dependencies
```
npm install
```
### 3. Run the server:
```
npm run dev   # for development with auto-reload
npm start     # for production
```
### 4. Open index.html in your browser to use the app.

## How It Works

- Upload your resume (PDF, DOCX, or TXT).

- System validates file type and content.

- Extracts skills, experience, and education.

- Detects skill gaps against job requirements.

- Recommends courses and certifications.

- Chatbot provides career guidance.

- Dashboard shows results and progress visually.

---

## 🚀 Keep Learning

Thank you for exploring SkillGap AI!  
Practice consistently and keep upgrading your skills to stay industry-ready.
