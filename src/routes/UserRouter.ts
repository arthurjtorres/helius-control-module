import { Router } from "express";
import UserController from "../controllers/UserController";
import { verifyToken } from "../middlewares/Authentication";

const userRouter = Router();

// Todas as rotas deste router exigem token JWT válido
userRouter.use(verifyToken);
const controller = new UserController();

// POST - Criação de usuário
userRouter.post("/", controller.createUser.bind(controller));

// PUT - Atualização de usuário (ID na URL, dados no body)
userRouter.put("/:id", controller.updateUser.bind(controller));

// DELETE - Exclusão de usuário por ID (via URL param)
userRouter.delete("/:id", controller.deleteUser.bind(controller));

// GET - Buscar usuário por ID (via URL param)
userRouter.get("/:id", controller.getUser.bind(controller));

// GET - Buscar usuários com filtros (via query params)
userRouter.get("/", controller.findUsers.bind(controller));

export default userRouter;
