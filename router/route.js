import express from "express";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controler/userContoler.js";

const router = express.Router();

// GET metods



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
// DELETE methods


export default router;