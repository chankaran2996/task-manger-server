import express from 'express';

const taskRouter = express.Router();

// get methods

taskRouter.get("/dashboard-data");

taskRouter.get("/user-dashboard-data");

taskRouter.get("/");

taskRouter.get("/:id");
// put methods

// post methods

// delete methods

export default taskRouter;