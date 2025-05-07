from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class TaskBase(BaseModel):
    title: str
    description: str
    user_id: str
    parent_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskInDB(TaskBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class SubTask(BaseModel):
    title: str
    description: str
    options: List[str] = []
    selected_options: List[str] = []

class TaskResponse(TaskBase):
    id: str
    sub_tasks: List[SubTask] = []
    summary: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str} 