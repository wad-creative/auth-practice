import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { profile } from "../controllers/auth/profile";
import { checkRole } from "../middleware/checkRole";

const router = express.Router();

router.get("/profile", requireAuth, checkRole, profile);

export default router;
