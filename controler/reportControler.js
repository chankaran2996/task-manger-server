import excelJS from 'exceljs';
import Task from '../models/TaskModel.js';
import { createTask } from './taskControler';

// This function generates a report of all tasks and sends it as an Excel file.
export const getTaskReport = async (req, res) => {
    try {
        const tasks = await Task.find({}).populate('assignedTo', 'name email');

        const workBook = new excelJS.Workbook();

        const workSheet = workBook.addWorksheet('Task Report');

        workSheet.columns = [
            { header: 'Task ID', key: '_id', width: 20 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Assigned To', key: 'assignedTo', width: 30 },
            { header: 'Created By', key: 'createdBy', width: 30 },
        ];
        
        tasks.forEach(task => {
            workSheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo.map(user => user.name).join(', '),
                createdBy: task.createdBy.name
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.setHeader('Content-Disposition', 'attachment; filename=task_report.xlsx');

        workBook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

// This function generates a report of all users and their task statistics, and sends it as an Excel file.
export const getUserReport = async (req, res) => {
    try {
        const users = await User.find({}).select('name email _id');
        const userTasks = await Task.find({}).populate('assignedTo', 'name email _id');

        const userTaskMap = [];
        users.forEach(user => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                tasksCount: 0,
                createTasks: 0,
                pendingTasks: 0,
                completedTasks: 0,
            };
        
        });

        userTasks.forEach(task => {
            if (task.assignedTo) {
                task.assignedTo.forEach(user => {
                    userTaskMap[user._id].tasksCount += 1;
                    if (task.status === 'created') {
                        userTaskMap[user._id].createTasks += 1;
                    } else if (task.status === 'pending') {
                        userTaskMap[user._id].pendingTasks += 1;
                    } else if (task.status === 'completed') {
                        userTaskMap[user._id].completedTasks += 1;
                    }
                });
            }
        });

        const workBook = new excelJS.Workbook();
        const workSheet = workBook.addWorksheet('User Task Report');

        workSheet.columns = [
            { header: 'User ID', key: '_id', width: 20 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Total Tasks Assigned', key: 'tasksCount', width: 25 },
            { header: 'Tasks Created', key: 'createTasks', width: 25 },
            { header: 'Pending Tasks', key: 'pendingTasks', width: 25 },
            { header: 'Completed Tasks', key: 'completedTasks', width: 25 },
        ];

        Object.values(userTaskMap).forEach(user => {
            workSheet.addRow({
                user
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=user_report.xlsx');

        workBook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}