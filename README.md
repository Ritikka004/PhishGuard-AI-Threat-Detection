# PhishGuard - AI Threat Detection

PhishGuard is a modern, real-time AI/ML-based phishing detection system featuring a dark-themed cybersecurity dashboard UI. It scores URLs and Emails based on extracted features and mock Machine Learning heuristics to classify them as SAFE, SUSPICIOUS, or DANGEROUS. 

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide React
- **Backend**: Python, Flask, SQLite, SQLAlchemy

## Project Structure
```text
AI-Phishing-Detection/
│
├── backend/                  # Flask REST API
│   ├── app.py                # Main backend logic and mock ML scoring
│   ├── requirements.txt      # Python dependencies
│   └── scans.db              # SQLite Database (generated automatically)
│
├── frontend/                 # React UI Dashboard
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite build config
│   ├── tailwind.config.js    # Tailwind colors and glows
│   └── src/                  # React Components and Pages
│
└── README.md                 # Setup instructions
```

## Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server (runs on `http://localhost:5000`):
   ```bash
   python app.py
   ```
   *Note: This will automatically initialize the `scans.db` SQLite database.*

---

### 2. Frontend Setup

**Prerequisite:** Ensure you have [Node.js](https://nodejs.org/) installed.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` to view the PhishGuard dashboard.

## Next Steps for AI Integration
The current `app.py` uses mock functions `analyze_url_mock` and `analyze_email_mock`. You can replace these logic blocks seamlessly by importing your trained Scikit-learn or XGBoost `pickle` files directly into `app.py` and updating those functions to return the model's predicted probability or risk score!
