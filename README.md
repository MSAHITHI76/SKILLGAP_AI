# SkillGap AI v2.0 — No API Key Required

> AI-powered career skill gap analysis, job matching, learning recommendations, and career roadmap.  
> **Runs 100% in your browser — no API key, no signup, no cost.**

---

## 🚀 Quick Start

**Just open `index.html` in any browser. That's it.**

```
Double-click index.html → App runs instantly
```

Optional — serve locally for best experience:
```bash
npx serve .
# → Open http://localhost:3000
```

---

## ✅ How It Works (No API)

| Module | Technology | API Needed? |
|---|---|---|
| Resume Parsing | PDF.js (CDN) + custom binary parser | ❌ No |
| Skill Extraction | Keyword NLP with 80+ skill database | ❌ No |
| Job Matching | Scoring algorithm with 20 job roles | ❌ No |
| Gap Analysis | Rule-based gap detection engine | ❌ No |
| Recommendations | 200+ curated courses database | ❌ No |
| Career Roadmap | Dynamic phase generator | ❌ No |
| AI Chatbot | Knowledge-base Q&A (150+ topics) | ❌ No |

---

## 📂 Project Structure

```
skill-gap-analyzer/
├─ index.html               ← Main app (open this)
├─ manifest.json            ← PWA manifest
├─ favicon.png              ← App icon
├─ package.json
│
├─ css/
│   ├─ vendors.css          ← Reset styles
│   └─ main.css             ← Full app design
│
├─ js/
│   ├─ skillDatabase.js     ← 📚 All skills, jobs, courses, chatbot KB
│   ├─ app.js               ← Main orchestrator
│   ├─ resumeUpload.js      ← Drag & drop + validation
│   ├─ resumeParser.js      ← PDF/DOCX/TXT text extraction
│   ├─ skillAnalysis.js     ← NLP skill detector
│   ├─ jobMatching.js       ← Match scoring engine
│   ├─ recommendations.js   ← Course recommender
│   ├─ chatbot.js           ← AI career guide
│   └─ progressBar.js       ← Animated progress bars
│
├─ backend/                 ← Optional Node.js backend
│   ├─ server.js
│   ├─ routes/
│   └─ utils/
│
├─ config/
│   └─ frontend-config.js   ← App configuration
│
├─ assets/
│   └─ logo_v3.png
│
└─ diagrams/
    └─ system-architecture.png
```

---

## 🎯 Features

- 📤 **Resume Upload** — PDF, DOC, DOCX, image, TXT via drag & drop
- ⚡ **Instant Skill Extraction** — Detects 80+ skills from resume text
- 💼 **Job Matching** — Scores against 20 real job role definitions
- ⚠️ **Gap Analysis** — Critical, High, Medium priority gaps
- 📚 **200+ Courses** — Real links to Coursera, Udemy, YouTube, freeCodeCamp
- 🗺️ **Career Roadmap** — 4-phase 12-month personalised plan
- 💬 **AI Chatbot** — 150+ career topics answered instantly
- 📱 **Fully Responsive** — Works on mobile, tablet, desktop

---

## 📜 License

MIT — free to use, modify, and deploy.
