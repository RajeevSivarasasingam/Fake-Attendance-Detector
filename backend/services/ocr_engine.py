import cv2
import pytesseract
import numpy as np

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
    
    # Simple logic to count 'P' and 'A'
    # For a real project you'd probably slice row by row looking for checkbox regions
    present_count = 0
    absent_count = 0
    
    # Normalize the extracted text
    words = text.split()
    for word in words:
        clean_word = "".join(filter(str.isalpha, word)).upper()
        if clean_word in ["PRESENT", "P"]:
            present_count += 1
        elif clean_word in ["ABSENT", "A"]:
            absent_count += 1
            
    return present_count, absent_count
