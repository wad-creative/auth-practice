import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/users.route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// port
const port = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Routes to test
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
