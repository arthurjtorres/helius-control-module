import { Router } from "express";
import UserController from "../controllers/UserController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission, checkPermissionOrSelf } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const userRouter = Router();

// Todas as rotas deste router exigem token JWT válido
userRouter.use(verifyToken);
const controller = new UserController();

// POST - Criação de usuário
userRouter.post("/", checkPermission("USUARIOS", PermissionEnum.CREATE), controller.createUser.bind(controller));

// PUT - Atualização de usuário (ID na URL, dados no body)
userRouter.put("/:id", checkPermissionOrSelf("USUARIOS", PermissionEnum.UPDATE), controller.updateUser.bind(controller));

// DELETE - Exclusão de usuário por ID (via URL param)
userRouter.delete("/:id", checkPermission("USUARIOS", PermissionEnum.DELETE), controller.deleteUser.bind(controller));

// PATCH - Reativação (activated = true)
userRouter.patch("/:id/reactivate", checkPermission("USUARIOS", PermissionEnum.UPDATE), controller.reactivateUser.bind(controller));

// GET - Buscar usuário por ID (via URL param)
userRouter.get("/:id", checkPermission("USUARIOS", PermissionEnum.READ), controller.getUser.bind(controller));

// GET - Buscar usuários com filtros (via query params)
userRouter.get("/", checkPermission("USUARIOS", PermissionEnum.READ), controller.findUsers.bind(controller));

export default userRouter;
