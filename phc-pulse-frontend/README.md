# PHC Pulse — Frontend

React (Vite) frontend for the PHC Pulse Smart Health system. Built to match
`API_SPEC.md` from the backend exactly — no invented endpoints.

## Setup

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**

⚠️ **Make sure the backend is running first** at `http://localhost:8000`
(`uvicorn app.main:app --reload` in the backend folder), otherwise login/signup
and all data calls will fail.

## How to use (first-time flow)

1. Go to `http://localhost:5173`
2. Click **Sign Up**, choose role **District Officer**, create an account
3. You'll land on the District Dashboard — go to **PHC Management** and add a PHC
4. Log out, **Sign Up** again with role **PHC Staff**, select the PHC you just created
5. You'll land on the PHC Staff Dashboard — try adding medicines, logging footfall,
   updating bed status, and scanning a stock register photo (needs `GEMINI_API_KEY`
   set in the backend `.env` to work)
6. Log back in as the District Officer to see the Overview and run
   **Redistribution → Refresh Suggestions**

## Structure

```
src/
├── context/AuthContext.jsx     → global login state (token, user), persisted to localStorage
├── utils/api.js                → fetch wrapper, auto-attaches Bearer token, handles 401
├── pages/
│   ├── LoginSignup.jsx         → login/signup with role picker
│   ├── PhcDashboard.jsx        → PHC staff dashboard shell
│   └── DistrictDashboard.jsx   → district officer dashboard shell
├── components/phc/             → MedicineStock, ScanStock (OCR), PatientFootfall, BedStatus, DoctorAttendance
├── components/district/        → OverviewCards, Redistribution, PhcManagement
└── components/shared/          → Sidebar, Alert, Loader, PulseDivider (signature ECG-line motif)
```

## Design notes

- Color system: deep teal/navy (trust, clinical) + coral accent (urgency/action) + cool paper background
- Typography: Space Grotesk (headings) + Inter (body) + JetBrains Mono (numbers/data — stock counts, percentages)
- The "pulse line" (small ECG trace) appears as a divider under every section title — a nod to the product name and to reframe the tool as a monitoring instrument, not a generic CRUD dashboard
- Fully responsive: sidebar collapses to a horizontal bar on mobile widths

## Backend URL

Hardcoded to `http://localhost:8000` in `src/utils/api.js`. If you deploy the
backend elsewhere, change the `BASE_URL` constant there.
