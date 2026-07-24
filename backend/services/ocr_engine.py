import cv2
import pytesseract
import numpy as np
import platform
import os

# Configure Tesseract path for Windows
if platform.system() == 'Windows':
    # Common installation paths for Tesseract OCR on Windows
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
    ]
    
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    else:
        # If not found in common paths, try to use system PATH
        try:
            pytesseract.get_tesseract_version()
        except pytesseract.TesseractNotFoundError:
            print("Warning: Tesseract OCR not found. Please install it from https://github.com/UB-Mannheim/tesseract/wiki")

def scan_sign_sheet(image_path: str) -> tuple[int, int]:
    """
    Simulates scanning a physical sign-in sheet using pytesseract OCR.
    Assumes the sheet has 'Present' or 'P' marks, and 'Absent' or 'A' marks.
    Returns a tuple: (present_count, absent_count)
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image file.")
    
    # Preprocessing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Optional: thresholding or blurring depending on the quality of the image
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Configure tesseract (adjust path if needed on Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe')
    # Using psm 6 (Assume a single uniform block of text) helps with tables/lists
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(thresh, config=custom_config)
    
    # Improved logic to count 'P' and 'A' with better edge case handling
    # For a real project you'd probably slice row by row looking for checkbox regions
    present_count = 0
    absent_count = 0
    
    # Normalize the extracted text
    words = text.split()
    for word in words:
        # Remove non-alphabetic characters and convert to uppercase
        clean_word = "".join(filter(str.isalpha, word)).upper()
        
        # Handle various representations of "Present"
        if clean_word in ["PRESENT", "P", "PRESENTT", "PRESEN", "PRSNT"]:
            present_count += 1
        # Handle various representations of "Absent"
        elif clean_word in ["ABSENT", "A", "ABSENTT", "ABSEN", "ABSNT"]:
            absent_count += 1
        # Handle single character cases (checkbox style)
        elif len(clean_word) == 1:
            if clean_word == "P":
                present_count += 1
            elif clean_word == "A":
                absent_count += 1
            elif clean_word == "X" or clean_word == "✓":
                # Could be either present or absent depending on context
                # For now, count as present (common convention)
                present_count += 1
            
    return present_count, absent_count
