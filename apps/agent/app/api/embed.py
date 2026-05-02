from fastapi import APIRouter
from pydantic import BaseModel
from app.core.note_vector import get_note_vector

router = APIRouter()

class notePrompt(BaseModel):
 content: str 


@router.post("/notes")
async def handle_embeding(data: notePrompt):
    result = await get_note_vector(data.content)
    return result