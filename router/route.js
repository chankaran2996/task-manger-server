import express from "express";
import { forgotPassword, getUserProfile, loginUser, registerUser, resetPassword, updateUserProfile } from "../controler/userContoler.js";
import { protect } from "../middleware/authMiddleware.js";

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


// PUT methods
// resting password
router.put('/reset-password/:token', resetPassword);

router.put('/profile', protect, updateUserProfile)
// DELETE methods


export default router;