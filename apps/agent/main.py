from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Response
import httpx
import uvicorn 
import os
from app.api.generation import router as generation_router
from app.api.embed import router as handle_embeding
load_dotenv()
app = FastAPI()
AGENT_PORT = int(os.getenv("AGENT_PORT"))
SERVER_URL = os.getenv("SERVER_URL")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
allowed_origins_str = os.getenv("SERVER_URL")
@app.get("/health")
async def health_check():
    try:
        api_key = os.getenv("GROQ_API_KEY")
        base_url = os.getenv("LLM_URL", "https://api.groq.com").rstrip("/")
        if not api_key:
            return Response(status_code=503, content="Missing API_KEY")
        health_url = f"{base_url}/openai/v1/models"    
        async with httpx.AsyncClient() as client:
            response = await client.get(
                health_url,
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=60.0
            ) 
        if response.status_code == 200:
            return {"status": "healthy", "llm": "connected", "model": "llama-3.3-70b-versatile"}     
        return Response(status_code=503, content=f"Groq API Error: {response.status_code}")
    except Exception as e:
        return Response(status_code=503, content=f"Agent Internal Error: {str(e)}")
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
app.include_router(
    handle_embeding,
    prefix="/embed",
    tags=["embeding Logic"]
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