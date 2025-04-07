import express from 'express';
import { createTask, deleteTask, getDashBoardData, getTask, getTaskById, getUserDashBoardData, updateTask, updateTaskCheckList, updateTaskStatus } from '../controler/taskControler.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const taskRouter = express.Router();

// get methods

taskRouter.get("/dashboard-data",getDashBoardData);

taskRouter.get("/user-dashboard-data",getUserDashBoardData);

taskRouter.get("/",getTask);

taskRouter.get("/:id",getTaskById);
// put methods

taskRouter.put("/:id",updateTask);

taskRouter.put("/:id/status",updateTaskStatus);

taskRouter.put("/:id/todo",updateTaskCheckList);

// post methods

taskRouter.post("/",adminOnly,createTask);

// delete methods

taskRouter.delete(":id",adminOnly,deleteTask);

export default taskRouter;