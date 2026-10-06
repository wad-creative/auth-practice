import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { profile } from "../controllers/auth/profile";
import { checkRole } from "../middleware/checkRole";
import { verifyCsrf } from "../lib/verifyCsrf";

const router = express.Router();

router.get("/profile", verifyCsrf, requireAuth, profile);

export default router;
