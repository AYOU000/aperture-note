from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_logic import get_project_tasks

router = APIRouter()

class UserPrompt(BaseModel):
    userid: str
    prompt: str

@router.post("/generate")
async def handle_prompt(data: UserPrompt):
    result = await get_project_tasks(data.userid, data.prompt)
    return result