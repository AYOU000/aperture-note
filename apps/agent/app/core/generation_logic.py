import os
import json
from ollama import AsyncClient
from fastapi import HTTPException
from app.core.prompts import SYSTEM_INSTRUCTIONS
from app.schemas.pydantic_models import ProjectResponse
client = AsyncClient(host=os.getenv("LLM_URL"))
LLM_MODEL = os.getenv("LLM_MODEL")
async def get_project_tasks( userid: str,prompt: str):

    try:
        response = await client.chat(
            model=LLM_MODEL,
            format="json",
            messages=[
                {'role': 'system', 'content': SYSTEM_INSTRUCTIONS},
                {'role': 'user', 'content': f"Goal: {prompt}"} ],
            keep_alive="1h"
        )
        raw_data = json.loads(response['message']['content'])
        validated_data = ProjectResponse(**raw_data)
        return validated_data.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))