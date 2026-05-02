import os
import json
from openai import AsyncOpenAI
from fastapi import HTTPException
from app.core.prompts import SYSTEM_INSTRUCTIONS
from app.schemas.pydantic_models import ProjectResponse

client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)
MODEL_ID = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

async def get_project_tasks(userid: str, prompt: str):
    try:
        response = await client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTIONS},
                {"role": "user", "content": f"Goal: {prompt}"}
            ],
            response_format={"type": "json_object"},  
            temperature=0.3,  
            max_tokens=1024,
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")

        raw_data = json.loads(content)
        validated_data = ProjectResponse(**raw_data)
        return validated_data.model_dump()

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")

    except Exception as e:
        print(f"Groq Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Agent Error: {str(e)}")