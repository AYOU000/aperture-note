from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Response
import httpx
import uvicorn 
import os
from app.api.generation import router as generation_router
app = FastAPI()
load_dotenv()
AGENT_PORT = int(os.getenv("AGENT_PORT"))
SERVER_URL = os.getenv("SERVER_URL")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
allowed_origins_str = os.getenv("SERVER_URL")
@app.get("/health")
async def health_check():
    try:
        async with httpx.AsyncClient() as client:
            llm_url = os.getenv("LLM_URL")
            response = await client.get(f"{llm_url}/api/tags", timeout=2.0)
            
        if response.status_code == 200:
            return {"status": "healthy", "llm_connection": "connected"}
        return Response(status_code=503, content="LLM Service Unreachable")
    except Exception as e:
        return Response(status_code=503, content=f"Agent Unhealthy: {str(e)}")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins= allowed_origins_str,  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
app.include_router(
    generation_router,
    prefix="/ai",
    tags=["Agent Logic"]
)
if __name__ == "__main__":
    print("Server starting...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=AGENT_PORT,
        reload=DEBUG,
        log_level="debug" if DEBUG else "info"
    )