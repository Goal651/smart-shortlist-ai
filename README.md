# Smart Shortlist AI 🚀

Smart Shortlist AI is a premium, AI-powered recruitment platform designed to automate the initial screening of resumes. By leveraging the power of **Google Gemini AI**, it analyzes candidates against specific job requirements, providing recruiters with instant scores, skill gap analysis, and professional summaries.

**🌐 Live Demo**: [https://smart-shortlist-ai-1.onrender.com/](https://smart-shortlist-ai-1.onrender.com/)

---

## ✨ Key Features

- **🎯 Precision AI Scoring**: Instant 0-100 score based on how well a candidate fits the job description.
- **📁 Bulk Resume Processing**: Upload dozens of resumes at once and let the AI screen them in parallel.
- **🔍 Deep Insights**: Goes beyond keywords to understand context, experience level, and education.
- **💼 Global Talent Hub**: A centralized database of all screened candidates with powerful search and filtering.
- **🚀 Monolithic Deployment**: Optimized Docker configuration for easy hosting on Render/Vercel.
- **🔐 Secure Auth**: Built-in authentication with auto-seeding for the initial admin account.

## 🏗️ Architecture Overview

The application is built as a modern full-stack monolith, optimized for seamless deployment on platforms like Render.

- **Frontend**: Next.js 16+ (App Router) with TypeScript, Tailwind CSS, and Lucide Icons.
- **Backend**: Node.js & Express with TypeScript.
- **Database**: MongoDB Atlas for persistent storage of jobs, applications, and AI analyses.
- **AI Engine**: Google Gemini Pro (Generative AI) for resume parsing and objective candidate scoring.
- **Proxy Layer**: A custom `proxy.js` handles routing between the Frontend (Next.js) and Backend (Express) within a single Docker container.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Google AI Studio API Key (Gemini)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aine1100/smart-shortlist-ai.git
   cd smart-shortlist-ai
   ```

2. **Install dependencies**:
   ```bash
   # Root (for proxy/deployment)
   npm install
   
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables) below).

4. **Run the application**:
   - **Backend**: `cd backend && npm run dev` (Runs on port 5000)
   - **Frontend**: `cd frontend && npm run dev` (Runs on port 3000)

---

## 🌐 Environment Variables

Set these in your `backend/.env` or in your Render/Vercel dashboard:

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `PORT` | Port for the proxy server (default: 10000 on Render) |
| `NODE_ENV` | Set to `production` or `development` |
| `OWNER_EMAIL` | Default admin email (for auto-seeding) |
| `OWNER_PASSWORD` | Default admin password (for auto-seeding) |

---

## 🧠 AI-Powered Screening Logic

The core value of Smart Shortlist AI lies in its objective screening pipeline:

1.  **Text Extraction**: Resumes (PDF/DOCX) are processed using `pdf-parse` and `mammoth` to extract raw text.
2.  **Prompt Engineering**: The extracted text is combined with the Job Description and sent to **Gemini Pro** using a strictly structured system prompt.
3.  **JSON Analysis**: Gemini returns a structured JSON object containing:
    - **Score (0-100)**: Calculated based on skill match and experience.
    - **Top Skills**: Key strengths found in the resume.
    - **Gaps**: Missing requirements compared to the job description.
    - **Reasoning**: A detailed explanation of why the candidate received their score.
    - **Recommendations**: Advice for the recruiter on how to proceed.
4.  **Automatic Profile Creation**: For every screened resume, the system automatically creates a rich **Candidate Profile** containing their work history, skills, and contact information.
5.  **Database Persistence**: Results are saved as `Candidate` profiles linked to the specific `Job`, allowing for long-term talent pool management.

---

## 🚀 Deployment (Render/Docker)

This project is configured for **Monolithic Docker Deployment**.

- The `Dockerfile` at the root builds both the frontend and backend.
- `proxy.js` routes incoming traffic:
    - `/api/*` requests go to the Express backend.
    - All other requests go to the Next.js frontend.
- **Auto-Seeding**: The app automatically creates a default "Owner" user upon the first successful database connection.

---

## 📝 Assumptions and Limitations

- **File Types**: Currently supports `.pdf` and `.docx`. Highly stylized or image-heavy PDFs (scanned) may have lower extraction accuracy.
- **AI Consistency**: While Gemini is highly accurate, LLM outputs can occasionally vary. We use strict JSON schemas to minimize parsing errors.
- **Monolith Design**: Designed for small-to-medium recruitment teams. For massive scale, the frontend and backend should be split into microservices.
- **Free Tier**: When deployed on Render's Free Tier, the initial request may be slow due to "spin-up" time.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

© 2026 Umurava AI. All rights reserved.
