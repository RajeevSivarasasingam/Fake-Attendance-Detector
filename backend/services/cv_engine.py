import cv2
from ultralytics import YOLO
import os

# Load the YOLOv8 model (pretrained on COCO dataset, which includes 'person')
# It will download the weights automatically the first time.
try:
    model = YOLO('yolov8n.pt')
    print("YOLOv8 model loaded successfully")
except Exception as e:
    print(f"Error loading YOLOv8 model: {e}")
    print("The model will be downloaded automatically on first run if not found")
    model = None 

def detect_headcount(image_path: str) -> int:
    """
    Counts the number of people in a given image.
    Uses YOLOv8 to detect 'person' objects (class 0).
    """
    if model is None:
        raise RuntimeError("YOLOv8 model not loaded. Please check the error logs.")
    
    # Run inference on the image
    results = model(image_path)
    
    person_count = 0
    
    # Iterate through the detected results
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # class 0 in COCO is 'person'
            if int(box.cls[0]) == 0:
                person_count += 1
                
    return person_count
