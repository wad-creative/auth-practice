import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/users.route.js";
import cors from "cors";
import { globalLimiter } from "./middleware/rateLimiters.js";

const app = express();

// CORS
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Global rate limiter
app.use(globalLimiter);

// Proxy
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");

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
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
