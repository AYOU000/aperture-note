from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn 
import os
app = FastAPI()
load_dotenv()
AGENT_PORT = int(os.getenv("AGENT_PORT"))
SERVER_URL = os.getenv("SERVER_URL")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
allowed_origins_str = os.getenv("SERVER_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins= allowed_origins_str,  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=AGENT_PORT,
        reload=DEBUG,
        log_level="debug" if DEBUG else "info"
    )