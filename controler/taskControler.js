import Task from "../models/TaskModel.js";

export const getTask = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const getTaskById = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
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
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const updateTask = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const deleteTask = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const updateTaskStatus = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const updateTaskCheckList = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const getDashBoardData = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

export const getUserDashBoardData = async(req, res) => {
    try {
        
    } catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}