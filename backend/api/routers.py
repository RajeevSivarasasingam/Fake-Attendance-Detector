from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from pydantic import BaseModel
import shutil
import os

from services.cv_engine import detect_headcount
from services.ocr_engine import scan_sign_sheet
from services.face_engine import recognize_faces

router = APIRouter()

class VerificationResponse(BaseModel):
    headcount: int
    sign_sheet_present: int
    sign_sheet_absent: int
    match: bool
    status: str

# Helper to save uploaded files temporarily
def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

@router.post("/headcount", response_model=dict)
async def get_headcount(file: UploadFile = File(...)):
    """
    Analyzes an image to determine the physical headcount in the classroom.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_path = f"temp_{file.filename}"
    save_upload_file(file, file_path)
    
    try:
        headcount = detect_headcount(file_path)
        return {"headcount_total": headcount}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/sign-sheet", response_model=dict)
async def process_sign_sheet(file: UploadFile = File(...)):
    """
    Scans a sign-in sheet to get the present and absent counts.
    """
    if not file.filename:
         raise HTTPException(status_code=400, detail="No file uploaded")

    file_path = f"temp_sheet_{file.filename}"
    save_upload_file(file, file_path)

    try:
        present_count, absent_count = scan_sign_sheet(file_path)
        return {
            "present_count": present_count,
            "absent_count": absent_count
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/verify", response_model=VerificationResponse)
async def verify_attendance(headcount: int, present_count: int, absent_count: int):
    """
    Compares the headcount with the present count from the sign sheet.
    """
    match = headcount == present_count
    status = "Attendance verified" if match else "Mismatch detected. Please trigger face recognition."
    
    return VerificationResponse(
        headcount=headcount,
        sign_sheet_present=present_count,
        sign_sheet_absent=absent_count,
        match=match,
        status=status
    )

@router.post("/face-recognition", response_model=dict)
async def perform_face_recognition(file: UploadFile = File(...)):
    """
    Fallback method: Uses facial recognition on the classroom to identify
    who is physically present.
    """
    if not file.filename:
         raise HTTPException(status_code=400, detail="No file uploaded")

    file_path = f"temp_face_{file.filename}"
    save_upload_file(file, file_path)
    
    try:
        # In a real scenario, you'd also pass known face encodings or load them from a DB here
        identified_students = recognize_faces(file_path)
        return {"identified_students": identified_students}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
    finally:
         if os.path.exists(file_path):
            os.remove(file_path)
