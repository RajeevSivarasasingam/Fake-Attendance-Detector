import cv2
from ultralytics import YOLO

# Load the YOLOv8 model (pretrained on COCO dataset, which includes 'person')
# It will download the weights automatically the first time.
model = YOLO('yolov8n.pt') 

def detect_headcount(image_path: str) -> int:
    """
    Counts the number of people in a given image.
    Uses YOLOv8 to detect 'person' objects (class 0).
    """
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
