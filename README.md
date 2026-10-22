# Ask OLake AI 🚀

**An AI-powered documentation assistant for OLake that helps developers find answers to their questions using official OLake documentation.**

Ask OLake AI combines documentation retrieval with a Large Language Model (LLM) to provide helpful answers, relevant documentation excerpts, and source links through a modern chat interface.

## ✨ Features

- 🤖 **AI-Powered Q&A** — Ask questions about OLake in natural language.
- 📚 **Documentation Retrieval** — Retrieves relevant content from OLake documentation to help answer queries.
- 🔗 **Source References** — Provides documentation source links to help users verify answers and explore topics further.
- 💬 **Interactive Chat Interface** — A conversational interface for asking technical questions.
- 🗂️ **Chat History** — Maintains conversations locally in the browser.
- 🎨 **Modern UI** — Green Aurora theme, animated orbit-inspired visuals, and a responsive layout.
- ⚡ **REST API** — Flask backend exposes an endpoint for submitting questions.
- 🔌 **LLM Integration** — Uses OpenRouter to connect to a configured language model.

## 🎯 Problem Statement

Technical documentation can be lengthy, making it difficult for developers to quickly find the exact information they need.

Ask OLake AI aims to simplify this process by allowing users to ask questions conversationally and receive relevant answers with links to supporting documentation.

## 🏗️ System Architecture

```text
User
 |
 v
React + Vite Frontend
 |
 | POST /ask
 v
Flask Backend
 |
 v
OLake Documentation Retrieval
 |
 v
Relevant Context + User Question
 |
 v
OpenRouter LLM
 |
 v
Generated Answer + Source Links
 |
 v
Chat Interface
```

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, Flask |
| API | REST API, Flask-CORS |
| AI Integration | OpenRouter API |
| Documentation Processing | Python, Requests, BeautifulSoup |
| Configuration | Python dotenv, environment variables |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
Ask-olake/
├── .vscode/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env                 
│   └── .venv/               
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md
```

*The structure above describes the main components; filenames may vary slightly depending on the current repository version.*

## ⚙️ Prerequisites

Install the following before running the project:

- Python 3
- Node.js and npm
- Git
- An OpenRouter API key
- Internet access for documentation retrieval and AI requests

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/jeevan6227/Ask-olake.git
cd Ask-olake
```

### 2. Set up the backend

Open a terminal in the project root.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation, you can use Command Prompt and run:

```bat
.venv\Scripts\activate.bat
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory.

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_supported_model_id
```

Replace the placeholder values with your own credentials and the model ID configured for your project.

**Security:** Never commit your actual `.env` file, API key, or other credentials to GitHub. Keep `backend/.env` in `.gitignore`.

### 4. Start the backend

From the `backend/` directory, run:

```bash
python app.py
```

The backend should start on the local address configured by the Flask application, typically:

```text
http://127.0.0.1:5000
```

Check the `/` or `/health` endpoint if available in your current backend version.

### 5. Set up the frontend

Open a second terminal from the project root.

```powershell
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
VITE_API_URL=http://127.0.0.1:5000
```

This points the frontend to your local Flask backend.

### 6. Run the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Keep both the frontend and backend running while testing the application.

## 🔌 API Reference

### Ask a question

**Endpoint:** `POST /ask`

**Content-Type:** `application/json`

Request body:

```json
{
  "question": "How does OLake Fusion compaction work?"
}
```

Example response shape:

```json
{
  "answer": "An explanation based on the retrieved documentation.",
  "sources": []
}
```

The exact response structure and source format depend on the backend implementation. Source entries should link to relevant OLake documentation when available.

### Example request using PowerShell

```powershell
$body = @{
    question = "How does OLake ingestion work?"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://127.0.0.1:5000/ask" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## 📖 About OLake

OLake is an open-source data integration platform focused on moving data into lakehouse storage formats such as Apache Iceberg. OLake Fusion supports maintenance workflows, including compaction.

Ask OLake AI is designed to make it easier to explore these concepts and locate relevant documentation.

For official resources:

- [OLake Documentation](https://olake.io/docs/)
- [OLake GitHub Organization](https://github.com/datazip-inc)
- [OpenRouter](https://openrouter.ai/)

## 🔒 Security Notes

- Store API keys in environment variables, not in source code.
- Never expose backend secrets in frontend environment variables.
- Keep `.env`, virtual environments, and dependency folders out of version control.
- Configure CORS to allow only the frontend origins you trust when deploying.
- Rotate any API key that has accidentally been exposed.

## 🗺️ Future Improvements

- Deploy the frontend and backend for public access.
- Improve retrieval quality and documentation coverage.
- Add streaming responses for a more interactive experience.
- Support richer source citations and documentation links.
- Add automated tests and improved error handling.
- Expand coverage of OLake ingestion, Fusion, and maintenance topics.

## 👨‍💻 Author

**Jeevan thanneru**

GitHub: [@jeevan6227](https://github.com/jeevan6227)

---

*Built to make exploring OLake documentation faster, simpler, and more conversational.*