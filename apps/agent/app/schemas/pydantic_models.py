from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TaskStatus(str, Enum):
    TODO = "TODO"

class TaskSchema(BaseModel):
    title: str = Field(..., description="Short action-oriented task title")
    description: str = Field(..., description="What needs to be done and why")
    priority: TaskPriority 
    status: TaskStatus = TaskStatus.TODO 
    order: int = Field(..., ge=0) 

class ProjectDetails(BaseModel):
    main_goal: str
    summary: str
    tasks: List[TaskSchema] 

class NoteSchema(BaseModel):
    content: str 

class ProjectResponse(BaseModel):
    project: ProjectDetails
    note: NoteSchema