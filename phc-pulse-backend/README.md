# PHC Pulse — Backend

Smart Health track ke liye backend: Medicine stock tracking (OCR se), Redistribution engine (unique feature), Patient footfall prediction, Bed status, Doctor attendance.

## 1. Setup karne ka tarika (VS Code me)

```bash
# 1. Virtual environment banao
python3 -m venv venv
source venv/bin/activate        # Windows pe: venv\Scripts\activate

# 2. Dependencies install karo
pip install -r requirements.txt

# 3. .env file banao
cp .env.example .env
# Ab .env file kholo aur apni PostgreSQL connection string + Gemini API key daalo
```

## 2. PostgreSQL setup

Agar PostgreSQL install nahi hai:
- Windows/Mac: https://www.postgresql.org/download/ se installer le lo
- Ya Docker se: `docker run --name phc-pg -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=phc_pulse -p 5432:5432 -d postgres`

Database banao (agar Docker use nahi kiya):
```sql
CREATE DATABASE phc_pulse;
```

`.env` me `DATABASE_URL` update kar do apni actual password ke saath.

## 3. Server run karo

```bash
uvicorn app.main:app --reload
```

Server chalega: http://localhost:8000
Auto-generated API docs (Swagger UI): http://localhost:8000/docs — yaha sabhi endpoints test kar sakte ho browser se hi.

Tables automatically ban jayenge first run pe (koi manual migration nahi chahiye abhi ke liye).

## 4. Gemini API Key kaise le

1. https://ai.google.dev/gemini-api/docs/api-key pe jao
2. Google account se sign in karo, "Create API Key" click karo
3. Free tier available hai, hackathon demo ke liye kaafi hai

## 5. Roles samajhna

- **district_officer**: signup ke waqt `phc_id` mat bhejo (null rahega). Ye role redistribution engine chala sakta hai, sab PHC dekh sakta hai.
- **phc_staff**: signup ke waqt apna `phc_id` bhejo (jo PHC pehle se district officer ne banaya ho). Ye role apna stock/footfall/attendance manage karega.

## 6. Testing ka flow (Swagger UI /docs se)

1. `/api/auth/signup` — district_officer bana lo
2. Us token se `/api/phc-centers/` pe PHC banao (Authorize button me token daalo Swagger UI me)
3. `/api/auth/signup` se phc_staff bana lo (us PHC ka id daal ke)
4. phc_staff token se `/api/medicines/manual` ya `/api/medicines/scan` se stock daalo
5. district_officer token se `/api/redistribution/generate` chalao
6. `/api/dashboard/district-overview` dekho

## 7. Frontend (Antigravity) ke liye

`API_SPEC.md` file dekho — usme saare endpoints, request/response format, aur auth flow documented hai. Wahi file Antigravity ko do reference ke liye.

## Folder structure

```
app/
├── core/          → config, database, security, auth dependencies
├── models/        → database tables (SQLAlchemy)
├── schemas/       → request/response formats (Pydantic)
├── routes/        → API endpoints
├── services/      → business logic (OCR, prediction, redistribution engine)
└── main.py        → app entry point
```
