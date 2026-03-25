Smart Attendance Counter

A hybrid attendance monitoring system designed for the University of Vavuniya. This project uses Computer Vision (YOLOv8) and Image Processing (OpenCV) to detect discrepancies between the number of students physically present in a lecture hall and the signatures recorded on an attendance sheet.

🚀 Tech Stack

Frontend: React Native (Expo)

Backend: FastAPI (Python)

AI/CV: YOLOv8 (Student counting), OpenCV (Signature detection)

Database: MongoDB

Hosting: AWS (EC2 & S3)

📋 Requirements

System Requirements

Hardware: Minimum 16GB RAM, NVIDIA GPU (recommended for local AI inference).

Python: 3.10 or higher.

Node.js: v18 or higher.

Tools: Android Studio (for emulator) or Expo Go (for physical device testing).

Backend Dependencies

fastapi & uvicorn (Web server)

ultralytics (YOLOv8)

opencv-python (Image processing)

motor (Async MongoDB driver)

python-multipart (Handling image uploads)

Frontend Dependencies

expo-camera (Camera access)

lucide-react-native (Icons)

react-native-svg (SVG support)

🛠️ Installation & Setup

1. Backend Setup (FastAPI)

Navigate to the backend directory:

cd backend


Create and activate a virtual environment:

# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate


Install the required libraries:

pip install -r requirements.txt


Run the server:

uvicorn main:app --reload --host 0.0.0.0 --port 8000


2. Frontend Setup (React Native)

Navigate to the frontend directory:

cd frontend


Install dependencies:

npm install


Update the API_BASE_URL in App.js with your computer's local IP address or your AWS EC2 Public IP.

Start the Expo development server:

npx expo start


Scan the QR code with your phone using the Expo Go app.

📸 How to Use

Login & Select Course: Open the app and select the course (e.g., IT3162).

Capture Hall: Take a clear photo of the lecture hall including all students. The backend uses YOLOv8 to count heads.

Capture Sheet: Take a steady, well-lit photo of the signature column on the attendance sheet. OpenCV will detect signatures.

Verification: The app will display the comparison. If the signature count is higher than the head count, a "Fraud Detected" alert will appear.

Action: Lecturers can apply a "Random Cancellation" penalty if fake signatures are confirmed.

📂 Project Structure

├── backend/
│   ├── main.py            # Entry point
│   ├── requirements.txt   # Python packages
│   ├── api/               # API Routers
│   └── services/          # YOLOv8 & OpenCV logic
├── frontend/
│   ├── App.js             # Main mobile logic
│   ├── app.json           # Expo config (Permissions)
│   └── package.json       # JS dependencies
└── README.md
