import Task from "../models/TaskModel.js";
import User from "../models/UserModel.js";

// Get all users with task counts
export const getUser = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");

    const userWithTaskCounts = await Promise.all(users.map(async (item) => {
      const pendingTasks = await Task.countDocuments({ assignedTo: item._id, status: "pending" });
      const inProgressTasks = await Task.countDocuments({ assignedTo: item._id, status: "In progress" });
      const completedTasks = await Task.countDocuments({ assignedTo: item._id, status: "completed" });

      return {
        ...item._doc,
        pendingTasks,
        inProgressTasks,
        completedTasks
      };
    }));

    res.status(200).json(userWithTaskCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// import Task from "../models/TaskModel.js";
// import User from "../models/UserModel.js";


// // get all user
// export const getUser = async (req, res) => {
//     try {
//         const users = await User.find({ role: "member" }).select("-password");

//         const userWithTaskCounts = await Promise.all( users.map(async (user) => {
//             const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "pending" });
//             const inProgessTask = await Task.countDocuments({ assignedTo: user._id, status: "In progress" });
//             const complectedTask = await Task.countDocuments({ assignedTo: user._id, status: "complected" });

//             return {
//                 ...user._doc,
//                 pendingTasks,
//                 inProgessTask,
//                 complectedTask
//             }

//         }));

//         res.status(200).json(userWithTaskCounts)
//     }
//     catch (error) {
//         res.status(500).json({ message: 'Serever error', error: error.message });
//     }
// }

// get user by ID
export const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }   
      res.status(200).json(user);
    }
    catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}

// delete user by ID
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).josn({ message: 'Serever error', error: error.message });
    }
}