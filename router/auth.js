import express from "express";
import passport from "passport";
// import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";

const authRoutes = express.Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const token = await generateToken(req.user._id)
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
);

authRoutes.get("/logout", (req, res) => {
  req.logout(() => res.redirect("http://localhost:5173/"));
});

export default authRoutes;