import os
import httpx  # Use this instead of requests
from fastapi import HTTPException

JINA_API_KEY = os.getenv("JINA_API_KEY")

async def get_note_vector(content: str):
    url = "https://api.jina.ai/v1/embeddings"
    if not JINA_API_KEY:
     print("⚠️ WARNING: JINA_API_KEY is not set in the environment!")
    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "jina-embeddings-v3",
        "task": "retrieval.passage",
        "dimensions": 1024, 
        "input": [content]
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers, timeout=10.0)
            
        if response.status_code != 200:
            print(f"Jina Error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Jina API failure")

        result = response.json()

        if 'data' not in result or not result['data']:
            print(f"❌ Unexpected Jina Response Format: {result}")
            raise HTTPException(status_code=500, detail="Invalid response format from Jina")
        
        embedding = result['data'][0]['embedding']
        print(f"✅ Success! Vector dimensions received: {len(embedding)}")
        return {"embedding":embedding}

    except Exception as e:
        print(f"Embedding Service Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))