import express from "express";
import { forgotPassword, getUserProfile, loginUser, registerUser, resetPassword, updateUserProfile } from "../controler/userContoler.js";
import { protect } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js";
import fs from 'fs';

const router = express.Router();

// GET metods
router.get('/profile',protect,getUserProfile);


// POST methods

// register
router.post('/register', registerUser);

// login 
router.post('/login', loginUser);

// verify user and sharing reset password link
router.post('/forgot-password', forgotPassword);

// Upload Img
router.post('/upload-img', upload.single('image'), async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
  
      // Optional: Delete the local file after upload
      fs.unlinkSync(req.file.path);
  
      res.json({
        message: 'Upload successful',
        url: result.secure_url
      });
    } catch (error) {
      console.error('Upload failed:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });


// PUT methods
// resting password
router.put('/reset-password/:token', resetPassword);

// Updating profile
router.put('/profile', protect, updateUserProfile)
// DELETE methods

export default router;