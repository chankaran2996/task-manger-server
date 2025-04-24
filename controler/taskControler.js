import Task from "../models/TaskModel.js";

// getting all tasks
export const getTask = async(req, res) => {
    try {
        const {status} = req.query;
        
        let fliter={};        

        if(status){
            fliter.status = status;
        }

        let tasks;

        req.user.role === "admin" ? 
        tasks = await Task.find(fliter).populate(
            "assignedTo", 
            "name email profileImgUrl"
        ) 
        : 
        tasks = await Task.find({...fliter, assignedTo: req.user._id}).populate(
            "assignedTo", 
            "name email profileImgUrl"
        );

        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoCheckList.filter((item) => item.completed).length;

                return {
                    ...task._doc,
                    completedCount: completedCount,
                    totalCount: task.todoCheckList.length,
                };
            }

            )
        );

        const allTask = await Task.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user._id }
        );

        const createdTask = await Task.countDocuments({
            status: "created",
            ...(req.user.role === "admin" ? {} : { assignedTo: req.user._id }),
        });

        const pendingTask = await Task.countDocuments({
            status: "pending",
            ...(req.user.role === "admin" ? {} : { assignedTo: req.user._id }),
        });

        const inProgressTask = await Task.countDocuments({
            status: "In progress",
            ...(req.user.role === "admin" ? {} : { assignedTo: req.user._id }),
        });

        const completedTask = await Task.countDocuments({
            status: "complected",
            ...(req.user.role === "admin" ? {} : { assignedTo: req.user._id }),
        });

        res.status(200).json({
            message: "Task fetched successfully",
            tasks,
            statusSummary:{
            allTask,
            createdTask,
            pendingTask,
            inProgressTask,
            completedTask
        }
        }); 

    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// getting task by id
export const getTaskById = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo", 
            "name email profileImgUrl"
        );

        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        res.status(200).json({message:"Task fetched by ID successfully", task});
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// creating new task
export const createTask = async(req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoCheckList
        }  = req.body;   
        
        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoCheckList,
            attachments
        });

        res.status(201).json({message:"Task created successfully" , task})
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// updating task
export const updateTask = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
        task.attachments = req.body.attachments || task.attachments;
        task.assignedTo = req.body.assignedTo || task.assignedTo;

        const updatedTask = await task.save();

        res.status(200).json({message:"Task updated successfully", updatedTask});
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// deleting task
export const deleteTask = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({message:"Task deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// updating task status by ID
export const updateTaskStatus = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        const isAssginedTo = task.assignedTo.some(
            (user) => user.toString() === req.user._id.toString()
        );

        if(!isAssginedTo && req.user.role !== "admin"){
            return res.status(403).json({message:"You are not authorized to update this task"})
        }

        task.status = req.body.status || task.status;

        if(task.status === "complected"){
            task.todoCheckList.forEach((item) => {
                item.completed = true;
            });
            task.progress = 100;
        }

        await task.save();

        res.status(200).json({message:"Task status updated successfully", task});
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// updating task checklist by ID
export const updateTaskCheckList = async(req, res) => {
    try {
        const { todoCheckList } = req.body;

        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        if(!task.assignedTo.includes(req.user._id) && req.user.role !== "admin"){
            return res.status(403).json({message:"You are not authorized to update this task"})
        }

        task.todoCheckList = todoCheckList || task.todoCheckList;

        const completedCount = task.todoCheckList.filter(
            (item) => item.completed
        ).length;

        task.progress = Math.round((completedCount / task.todoCheckList.length) * 100);

        if(task.progress === 100){
            task.status = "complected";
            task.todoCheckList.forEach((item) => {
                item.completed = true;
            });
        }else if(task.progress > 0){
            task.status = "In progress";
        }else{
            task.status = "created";
        }

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo", 
            "name email profileImgUrl"
        );

        res.status(200).json({message:"Task checklist updated successfully", task: updatedTask});
    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// getting dashboard data
export const getDashBoardData = async(req, res) => {
    try {
        const totalTask = await Task.countDocuments({});
        const createdTask = await Task.countDocuments({status:"created"});
        const pendingTask = await Task.countDocuments({status:"pending"});
        const inProgressTask = await Task.countDocuments({status:"In progress"});
        const completedTask = await Task.countDocuments({status:"complected"});
        const overdueTask = await Task.countDocuments(
            {
                status:"complected", 
                dueDate: {$lt: Date.now()}
            }
        );

        const taskStatus = ["created", "pending", "In progress", "complected"];

        const taskDistributionRow = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistributionButton = taskStatus.reduce((acc, status) => {
            const formattedkey = status.replace(/\s+/g, '');
            acc[formattedkey] = 
            taskDistributionRow.find(
                (item) => item._id === status
            )?.count || 0;
            return acc;
        }, {});

        taskDistributionButton["All"] = totalTask;
        // console.log(taskDistributionButton);

        const taskPriorities = ["Low", "Medium", "High"];

        const taskPriorityRow = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskPrioritiesLevel = taskPriorities.reduce((acc, priority) => {
            
            acc[priority] = 
            taskPriorityRow.find(
                (item) => item._id === priority
            )?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
            "title status priority dueDate createdAt"
        );

        res.status(200).json({
            message: "Dashboard data fetched successfully",
            statistics: {
                totalTask,
                createdTask,
                pendingTask,
                inProgressTask,
                completedTask,
                overdueTask
            },
            charts: {
                taskDistributionButton,
                taskPrioritiesLevel
            },
            recentTasks
        });

    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}

// getting user dashboard data
export const getUserDashBoardData = async(req, res) => {
    try {
        const userId = req.user._id;

        const totalTask = await Task.countDocuments({ assignedTo: userId });
        const createdTask = await Task.countDocuments({ assignedTo: userId, status:"created"});
        const pendingTask = await Task.countDocuments({ assignedTo: userId, status:"pending"});
        const inProgressTask = await Task.countDocuments({ assignedTo: userId, status:"In progress"});
        const completedTask = await Task.countDocuments({ assignedTo: userId, status:"complected"});
        const overdueTask = await Task.countDocuments(
            {
                assignedTo: userId,
                status:"complected", 
                dueDate: {$lt: Date.now()}
            }
        );

        const taskStatus = ["created", "pending", "In progress", "complected"];

        const taskDistributionRow = await Task.aggregate([
            {
                $match: { assignedTo: userId },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistributionButton = taskStatus.reduce((acc, status) => {
            const formattedkey = status.replace(/\s+/g, '');
            acc[formattedkey] = 
            taskDistributionRow.find(
                (item) => item._id === status
            )?.count || 0;
            return acc;
        }, {});

        taskDistributionButton["All"] = totalTask;

        const taskPriorities = ["Low", "Medium", "High"];

        const taskPriorityRow = await Task.aggregate([
            {
                $match: { assignedTo: userId },
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskPrioritiesLevel = taskPriorities.reduce((acc, priority) => {
            
            acc[priority] = 
            taskPriorityRow.find(
                (item) => item._id === priority
            )?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })    
        .limit(10)
        .select(
            "tittle status priority dueDate createdAt"
        );

        res.status(200).json({
            message: "Dashboard data fetched successfully",
            statistics: {
                totalTask,
                createdTask,
                pendingTask,
                inProgressTask,
                completedTask,
                overdueTask
            },
            charts: {
                taskDistributionButton,
                taskPrioritiesLevel
            },
            recentTasks
        });


    } catch (error) {
        res.status(500).json({ message: 'Serever error', error: error.message });
    }
}