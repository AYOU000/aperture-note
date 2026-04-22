import os
import json
from ollama import AsyncClient
from fastapi import HTTPException
client = AsyncClient(host=os.getenv("LLM_URL"))
LLM_MODEL = os.getenv("LLM_MODEL")
async def get_project_tasks( userid: str,prompt: str):
    system_instructions = (
        "You are a project management assistant. Respond ONLY in JSON format. "
        "Structure: { 'projects': { 'main_goal': 'string', 'tasks': ['t1', 't2', 't3'] } }"
    )
    try:
        response = await client.chat(
            model=LLM_MODEL,
            format="json",
            messages=[
                {'role': 'system', 'content': system_instructions},
                {'role': 'user', 'content': f"Goal: {prompt}"} ],
            keep_alive="1h"
        )
        return json.loads(response['message']['content'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))