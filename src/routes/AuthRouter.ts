import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { createLoginRateLimit } from "../middlewares/LoginRateLimit";

const authRouter = Router();
const controller = new AuthController();

// 3 falhas por IP + login em 15 min → 429 (só esta rota)
authRouter.post("/", createLoginRateLimit(), controller.login.bind(controller));

export default authRouter;
