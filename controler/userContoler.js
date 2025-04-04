import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js';
import transporter from '../config/nodemailerAuth.js';

// Register User
export const registerUser = async (req, res) => {
  try{
    const { username, email, password, profileImgUrl, adminInviteToken} = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // checking role
    let role = "member";
    if(adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
      role = "admin"
    }

    const user = await User.create({ username, email, password, profileImgUrl, role });
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImgUrl: user.profileImgUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
};

// Login User
export const loginUser = async (req, res) => {
  try{  
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImgUrl: user.profileImgUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try{  
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for one hour.</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Password reset email sent' });
    });
  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try{  
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ 
      resetToken: token, 
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
};

// getting user detials
export const getUserProfile = async (req, res) => {
  console.log(req.user)
  try{
    // const user = await User.findById(req.user._id).select("-password");
    const user = await User.findById(req.user._id).select("-password");
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user)
  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
}

export const updateUserProfile = async (req, res) => {
  try{
    const user = await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    user.profileImgUrl = req.body.profileImgUrl || user.profileImgUrl;

    const updateUser = await user.save();

    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImgUrl: user.profileImgUrl,
      token: generateToken(user._id),
    });

  }catch{
    res.status(500).josn({message:'Serever error',error:error.message});
  }
}
