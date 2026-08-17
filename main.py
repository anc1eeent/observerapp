from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base, Session


ObserverTasker = FastAPI()

ObserverTasker.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

# task config
tasks = [{
    "id": 1,
    "title": "Запустити FastAPI",
    "completed": True,
    "priority": "Low",
    "up_to_date": "08.16.2026",
    "note": None
}]

# GET - method for test
@ObserverTasker.get("/")
def check_server():
    return {"status": "ok", "message": "ObserverTasker is running!"}

# GET - method for task config
@ObserverTasker.get("/tasks")
def get_tasks():
    return tasks

class TaskCreate(BaseModel):
    title: str
    completed: bool
# 0 - low , 1 - medium , 2 - hard , 3 - extraordinary
    priority: int
    up_to_date: str
    note: str

# POST - method
@ObserverTasker.post("/tasks")
# creating tasks
def create_tasks(new_task: TaskCreate):
    # new object
    task_dict = new_task.model_dump()
    # define id
    id_task = len(tasks) + 1
    task_dict["id"] = id_task
    tasks.append(task_dict)
    return {"status": "success", "task": task_dict }    

# DELETE - method
@ObserverTasker.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for index, task in enumerate(tasks):
        if task["id"] == task_id:
            del tasks[index]
            return {"status": "success", "message": f"Task {task_id} was deleted" }
    raise HTTPException(status_code=404, detail="Task not found")

# PUT - method
@ObserverTasker.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: TaskCreate):
    for index, task in enumerate(tasks):
        if task["id"] == task_id:
            task_dict = updated_task.model_dump()
            task_dict["id"] = task_id
            tasks[index] = task_dict
        return {"status": "success", "task": task_dict}
    raise HTTPException(status_code=404, detail="Task not found")
