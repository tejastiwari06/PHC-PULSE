# PHC Pulse — API Specification (Frontend ke liye)

Base URL (local dev): `http://localhost:8000`

Auth: Har protected endpoint ko header me chahiye:
```
Authorization: Bearer <access_token>
```
Token milta hai login/signup response me.

Do roles hain: `district_officer` aur `phc_staff`. Kuch endpoints sirf ek role use kar sakta hai (niche mentioned hai).

---

## AUTH

### POST /api/auth/signup
Role: Koi bhi (public)
Request:
```json
{
  "full_name": "string",
  "email": "string",
  "password": "string",
  "role": "district_officer" | "phc_staff",
  "phc_id": 1   // sirf phc_staff ke liye required, district_officer ke liye null bhejo
}
```
Response (200):
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "full_name": "...", "email": "...", "role": "phc_staff", "phc_id": 1 }
}
```

### POST /api/auth/login
Request: `{ "email": "string", "password": "string" }`
Response: same as signup

---

## PHC CENTERS

### POST /api/phc-centers/
Role: district_officer only
Request: `{ "name": "string", "district": "string", "state": "string", "latitude": 28.5, "longitude": 77.4, "total_beds": 10 }`
Response: same object + `"id": 1`

### GET /api/phc-centers/
Role: any logged-in user
Response: array of PHC objects

---

## MEDICINES

### POST /api/medicines/scan
Role: phc_staff only
Content-Type: multipart/form-data, field name: `file` (image)
Response:
```json
{
  "extracted_items": [
    { "name": "Paracetamol 500mg", "quantity": 200, "confidence": 88, "expiry_date": "2026-12-01" }
  ],
  "message": "Confirm karne ke liye /confirm-scan use karein"
}
```
⚠️ Ye SAVE nahi karta. UI me ye items dikhao, user ko edit/confirm karne do, phir `/confirm-scan` call karo.

### POST /api/medicines/confirm-scan
Role: phc_staff only
Request: array of `{ "name": "string", "current_quantity": 200, "unit": "tablets", "expiry_date": "2026-12-01" }`
Response: array of saved Medicine objects

### POST /api/medicines/manual
Role: phc_staff only
Request: `{ "name": "string", "current_quantity": 100, "unit": "tablets", "expiry_date": "2026-12-01" }`
Response: Medicine object

### GET /api/medicines/my-phc
Role: any logged-in user (staff apna PHC dekhega)
Response: array of:
```json
{
  "id": 1, "phc_id": 1, "name": "Paracetamol 500mg", "current_quantity": 300,
  "unit": "tablets", "expiry_date": "2026-12-01", "last_ocr_confidence": 88,
  "source": "manual", "days_remaining": 21.5
}
```
Note: `days_remaining` null ho sakta hai agar itna consumption data nahi hai abhi.

### POST /api/medicines/consume
Role: phc_staff only
Request: `{ "medicine_id": 1, "quantity_used": 5 }`
Response: `{ "message": "...", "remaining_quantity": 295 }`

---

## REDISTRIBUTION (Unique feature)

### POST /api/redistribution/generate
Role: district_officer only
Ye engine trigger karta hai — naye suggestions banata hai. Response: array of suggestions.

### GET /api/redistribution/all
Role: district_officer only
Response:
```json
[
  {
    "id": 1, "medicine_name": "Paracetamol 500mg",
    "from_phc_id": 1, "to_phc_id": 2, "suggested_quantity": 50,
    "reason": "Paracetamol sirf 3 din me khatam hogi...",
    "status": "suggested", "created_at": "2026-07-04T10:00:00"
  }
]
```
`status` values: `suggested` | `approved` | `completed` | `rejected`

### PATCH /api/redistribution/{id}/status?new_status=approved
Role: district_officer only
Query param `new_status`: one of the status values above.

---

## OPERATIONS (Footfall, Beds, Doctor Attendance)

### POST /api/operations/footfall
Role: phc_staff only
Request: `{ "date": "2026-07-04", "patient_count": 45, "symptom_tag": "fever", "symptom_count": 5 }`
(`symptom_tag`/`symptom_count` optional)

### GET /api/operations/footfall/predict
Role: any logged-in user
Response: `{ "predicted_count": 42, "based_on_days": 7 }`

### PUT /api/operations/beds
Role: phc_staff only
Request: `{ "total_beds": 10, "occupied_beds": 6 }`

### POST /api/operations/attendance/check-in
Role: any logged-in user (doctor)
Request: `{ "phc_id": 1 }`

### POST /api/operations/attendance/check-out
Role: any logged-in user (doctor)
No body needed.

---

## DASHBOARD

### GET /api/dashboard/district-overview
Role: district_officer only
Response:
```json
[
  {
    "phc_id": 1, "phc_name": "PHC Dadri", "district": "GB Nagar",
    "critical_stock_medicines": 2, "bed_occupancy_percent": 60.0,
    "doctors_checked_in_today": 1, "pending_redistribution_transfers": 1
  }
]
```

---

## Error format (all endpoints)
```json
{ "detail": "Human-readable message in Hinglish/English" }
```
Common status codes: `401` (not logged in / bad token), `403` (wrong role), `404` (not found), `422` (validation error), `500` (server error).

## Recommended screens for frontend

1. **Login/Signup** — role selector (PHC Staff / District Officer)
2. **PHC Staff Dashboard**: stock list (with days_remaining warning colors), scan-upload button, footfall entry, bed toggle, own attendance check-in/out
3. **District Officer Dashboard**: overview cards per PHC, redistribution suggestions list (approve/reject buttons), PHC management (add new PHC)
