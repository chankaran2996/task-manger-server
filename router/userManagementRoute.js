import express from "express";
import { adminOnly } from "../middleware/authMiddleware.js";
import { deleteUser, getUser, getUserById } from "../controler/userManagementControler.js";

const userMangementRoute = express.Router();

// get method

// get all user
userMangementRoute.get("/", adminOnly, getUser);

// get perticular user
userMangementRoute.get("/:id", getUserById);

// post method

// put method

// delete method

// delete user
userMangementRoute.delete("/:id", adminOnly, deleteUser);

export default userMangementRoute;