<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini" />
  
  <br />
  <br />

  <h1 align="center">MemeGenAI</h1>
  <p align="center">
    <strong>An advanced, multimodal AI meme generator with semantic routing and an interactive visual editor.</strong>
  </p>
</div>

---

## 🚀 Overview

MemeGenAI is a full-stack, cloud-native application that transforms natural language situations into mathematically perfect, context-aware internet humor. Unlike standard text-to-image models, MemeGenAI uses **Multimodal Visual Reasoning** to understand uploaded images and perfectly place text exactly where it belongs in the scene.

## ✨ Key Features

- **Semantic Template Routing:** Type a generic idea (e.g., *"when the code compiles but you don't know why"*) and the AI will automatically fetch the most contextually relevant template using semantic embeddings.
- **Multimodal Custom Uploads:** Upload your own blank images. The AI uses computer vision (Gemini 2.5 Flash) to analyze the scene, write a joke, and dynamically map the text boundaries to in-universe objects (like a whiteboard, piece of paper, or speech bubble).
- **Interactive Visual Editor:** Don't like the AI's exact placement? Open the generated meme in the drag-and-drop React visual editor. Resize bounding boxes like a whiteboard app, change colors, edit text, and recompile the image flawlessly on the Python backend.
- **Cloud-Native Architecture:** Fully stateless backend integrated with Supabase. Stores vectors, generation history, and image assets seamlessly in the cloud with strict Row Level Security (RLS) policies.

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 14** (App Router)
- **React** (Hooks, Custom Drag-and-Drop)
- **Tailwind CSS** (Glassmorphism, Dynamic Container Queries)
- **Supabase Auth / Storage**

**Backend:**
- **Python 3**
- **FastAPI**
- **Pillow (PIL)** (High-fidelity text rendering and compilation)
- **Google Generative AI** (Gemini 2.5 Flash Multimodal + Gemma Failover)
- **Supabase / PostgreSQL** (pgvector for semantic search)

---

## ⚙️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/MemeGenAI.git
cd MemeGenAI
```

### 2. Backend Setup (FastAPI)
Navigate to the root folder, set up your virtual environment, and install dependencies.
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the root directory for your Python server:
```ini
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup (Next.js)
Open a new terminal and navigate to the frontend folder.
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:
```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🧠 How It Works

1. **Prompt Ingestion:** The user submits a scenario in the Next.js Workshop.
2. **Vector Math:** Supabase `pgvector` calculates the cosine similarity between the prompt and thousands of template embeddings, returning the top matches.
3. **Multimodal Analysis:** The backend opens the blank template and feeds it alongside the prompt to Gemini 2.5 Flash, returning precise `[x1, y1, x2, y2]` bounding coordinates.
4. **Assembly & Storage:** Python's PIL dynamically shrinks the font to perfectly fit the bounding box limits, renders the image, and uploads the artifact to Supabase Cloud Storage.
5. **Interactive UI:** The user can launch the Interactive Editor, manipulating the layout natively on the DOM. Saving the edits pushes a `PATCH` request, safely bypassing RLS constraints to re-render the final JPEG losslessly.

---

<div align="center">
  <p>Built for the 2026 AI Hackathon Submission.</p>
</div>
