import { Router } from "express";
import UserController from "../controllers/UserController";
import { allowServiceToken, verifyToken } from "../middlewares/Authentication";
import { checkPermission, checkPermissionOrSelf, requireServiceToken } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const userRouter = Router();
const controller = new UserController();

// POST - Demissão (T20): só token de serviço do `registry`; antes do `use(verifyToken)` por causa do `allowServiceToken`
userRouter.post("/deactivate-by-employee", allowServiceToken, verifyToken, requireServiceToken, controller.deactivateByEmployee.bind(controller));

// Demais rotas deste router exigem token JWT válido
userRouter.use(verifyToken);

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
