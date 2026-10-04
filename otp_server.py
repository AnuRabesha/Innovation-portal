"""
OTP Backend Server – Innovation Portal (FastAPI)
Run: uvicorn otp_server:app --port 5000 --reload
Requires: pip install fastapi uvicorn[standard]
"""
import random, time, smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── EMAIL CONFIG ──────────────────────────
SMTP_EMAIL    = "your_gmail@gmail.com"      # <-- replace with your Gmail
SMTP_PASSWORD = "your_app_password"         # <-- replace with Gmail App Password

# ── OTP STORE (in-memory) ─────────────────
otp_store: dict = {}
OTP_EXPIRY = 300  # 5 minutes

# ── MODELS ───────────────────────────────
class OTPRequest(BaseModel):
    email: Optional[str] = None
    emailOrUsername: Optional[str] = None
    emailOrId: Optional[str] = None
    resend: Optional[bool] = False

class OTPVerify(BaseModel):
    email: Optional[str] = None
    emailOrUsername: Optional[str] = None
    emailOrId: Optional[str] = None
    otp: str

# ── HELPERS ──────────────────────────────
def extract_email(data: dict) -> str:
    return (
        data.get("email") or
        data.get("emailOrUsername") or
        data.get("emailOrId") or
        ""
    ).strip().lower()

def mask_email(email: str) -> str:
    parts = email.split("@")
    return parts[0][:2] + "***@" + parts[1]

def send_email_otp(to_email: str, otp: str):
    body = f"""Hello,

Your OTP for Innovation Portal is:

  {otp}

Valid for 5 minutes. Do not share it with anyone.

– Innovation Portal Team"""
    msg = MIMEText(body)
    msg["Subject"] = "Your Innovation Portal OTP"
    msg["From"]    = SMTP_EMAIL
    msg["To"]      = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

# ── ROUTES ───────────────────────────────
from fastapi.responses import JSONResponse

@app.post("/api/otp/send")
async def send_otp(payload: OTPRequest):
    email = extract_email(payload.dict())
    if not email or "@" not in email:
        return JSONResponse({"message": "Valid email is required."}, status_code=400)

    otp = str(random.randint(100000, 999999))
    otp_store[email] = {"otp": otp, "expires_at": time.time() + OTP_EXPIRY}

    try:
        send_email_otp(email, otp)
    except Exception as ex:
        return JSONResponse({"message": f"Failed to send email: {str(ex)}"}, status_code=500)

    return {"maskedTarget": mask_email(email), "channel": "email"}

@app.post("/api/otp/verify")
async def verify_otp(payload: OTPVerify):
    email = extract_email(payload.dict())
    otp   = payload.otp.strip()

    record = otp_store.get(email)
    if not record:
        return JSONResponse({"message": "OTP not found. Please request a new one."}, status_code=400)
    if time.time() > record["expires_at"]:
        otp_store.pop(email, None)
        return JSONResponse({"message": "OTP expired. Please request a new one."}, status_code=400)
    if otp != record["otp"]:
        return JSONResponse({"message": "Invalid OTP. Please try again."}, status_code=400)

    otp_store.pop(email, None)
    return {"success": True, "token": f"demo-token-{email}"}
