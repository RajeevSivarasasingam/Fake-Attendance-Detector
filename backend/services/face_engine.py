import face_recognition
import cv2
import os
import numpy as np

# In a real app, these encodings would come from a database associated with student IDs
# For this example, we'll assume a 'known_faces' directory exists
KNOWN_FACES_DIR = "known_faces"

def load_known_faces():
    """
    Loads images from a known directory, extracts face encodings,
    and returns a dictionary of name -> encoding.
    """
    known_encodings = []
    known_names = []
    
    if not os.path.exists(KNOWN_FACES_DIR):
        # Create a dummy dir to avoid crashing if it doesn't exist
        os.makedirs(KNOWN_FACES_DIR)
        return known_names, known_encodings
        
    for filename in os.listdir(KNOWN_FACES_DIR):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            # The name is just the filename without extension (e.g., "John_Doe.jpg" -> "John_Doe")
            name = os.path.splitext(filename)[0]
            
            image_path = os.path.join(KNOWN_FACES_DIR, filename)
            image = face_recognition.load_image_file(image_path)
            
            # Get the face encoding for the single face in the image
            encodings = face_recognition.face_encodings(image)
            if len(encodings) > 0:
                known_encodings.append(encodings[0])
                known_names.append(name)
                
    return known_names, known_encodings

# Load these once on startup to save time during requests
known_names, known_encodings = load_known_faces()

def recognize_faces(image_path: str) -> list[str]:
    """
    Identifies faces in a given classroom image and matches them 
    against known student face encodings.
    """
    # Use the globally loaded known faces instead of reloading
    if not known_encodings:
         return ["No known faces recorded in the system."]
    
    # Load the classroom image
    unknown_image = face_recognition.load_image_file(image_path)
    
    # Find all faces in the classroom image
    face_locations = face_recognition.face_locations(unknown_image)
    face_encodings = face_recognition.face_encodings(unknown_image, face_locations)
    
    identified = []
    
    # Loop over each found face in the classroom
    for unknown_encoding in face_encodings:
        # Find the closest match using face distance for better accuracy
        face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
        best_match_index = np.argmin(face_distances)
        
        # Use a tolerance threshold to determine if it's a match
        # Lower tolerance = stricter matching
        if face_distances[best_match_index] < 0.6:
            name = known_names[best_match_index]
        else:
            name = "Unknown Student"
            
        identified.append(name)
        
    return list(set(identified)) # Return unique names to avoid duplicates if same person is found twice
