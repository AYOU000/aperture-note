from fastapi import FastAPI
from pydantic import BaseModel
import requests
import json
import uvicorn 

app = FastAPI()

class Query(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_task(query: Query):
    # 'host.docker.internal' is correct for reaching Ollama on Windows
    ollama_url = "http://host.docker.internal:11434/api/generate"
    
    system_instruction = "Return ONLY a JSON list of 3 tasks based on this goal. Format: [{\"content\": \"task name\"}]"
    
    payload = {
        "model": "llama3.1:8b",
        "prompt": f"{system_instruction} Goal: {query.prompt}",
        "stream": False,
        "format": "json"
    }
    
    try:
        response = requests.post(ollama_url, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        return json.loads(result['response'])
    except Exception as e:
        return {"error": f"Failed to connect to Ollama: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)