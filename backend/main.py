from fastapi import fastapi
from fastapi.middleware.cors import CORSMiddleware
from api.routers import router

app = FastAPI(title="Smart Attendance Detector API")

# Configure CORS for React Native frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Attendance Detector API"}
