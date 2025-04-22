import transporter from "../config/nodemailerAuth.js";
import Task from "../models/TaskModel.js";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// Get all users with task counts
export const getUser = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");

    const userWithTaskCounts = await Promise.all(users.map(async (item) => {
      const pendingTasks = await Task.countDocuments({ assignedTo: item._id, status: "pending" });
      const inProgressTasks = await Task.countDocuments({ assignedTo: item._id, status: "In progress" });
      const completedTasks = await Task.countDocuments({ assignedTo: item._id, status: "completed" });
      const createdTask = await Task.countDocuments({assignedTo: item._id, status:"created"})
      return {
        ...item._doc,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        createdTask
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


export const addMember = async (req, res) => {
    try {
        const { username, email, profileImgUrl, adminInviteToken} = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // checking role
        let role = "member";
        if(adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
          role = "admin"
        }

        const user = new User({ username, email, profileImgUrl,  role });
        const data =await user.save();

        const token = generateToken(data._id); // Assuming you have a method to generate a token
        // Send email to the user with the invite link 
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;

        
        await user.save();

        const passwordSetLink = `http://localhost:5173/set-password/${token}`;

        const mailOptions = {
            // from:"chandrasekaran@guvi.in",
            to: email,
            subject: 'Invite to join our platform',
            text: `You have been invited to join our platform. Please set your password using the following link: ${passwordSetLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email', error: error.message });
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'User added successfully', user });
    } catch (error) {
      console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}