import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./database/connection.js";
import router from "./router/route.js";
import session from "express-session";
import passport from "passport";
import "./passport.js"; // Import passport configuration
import authRoutes from "./router/auth.js";
import userMangementRoute from "./router/userManagementRoute.js";
import { adminOnly, protect } from "./middleware/authMiddleware.js";
import taskRouter from "./router/taskRoutes.js";
import reportRoutes from "./router/reportRoutes.js";
// import authRoutes from "./routes/auth.js";
import cors from "cors";



const app = express();
app.use(express.json());

app.use(cors()); // Enable CORS for all routes

// creating responce for home routs
app.get("/", (req, res) => {
  res.status(200).json("Sucessfully connected");
});

app.use(session({ secret: "your_secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes); // Authentication routes

app.use("/api",router);

app.use("/api/user", protect ,userMangementRoute);

app.use("/api/task", protect ,taskRouter);

app.use("/api/report", protect , adminOnly, reportRoutes);

// connnection
const startserver = async () => {
    await connectDB();
    //  starting server
    app.listen(process.env.PORT, () => {
      console.log(`Server Rur at ${process.env.PORT}`);
    });
  };
  startserver();
