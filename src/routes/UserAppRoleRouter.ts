import { Router } from "express";
import UserAppRoleController from "../controllers/UserAppRoleController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const userAppRoleRouter = Router();

// Todas as rotas deste router exigem token JWT válido
userAppRoleRouter.use(verifyToken);
const controller = new UserAppRoleController();

// POST - Criar vínculo papel-usuário
userAppRoleRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.createUserAppRole.bind(controller));

// PUT - Atualizar vínculo por ID
userAppRoleRouter.put("/:id", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.updateUserAppRole.bind(controller));

// DELETE - Remover vínculo por ID
userAppRoleRouter.delete("/:id", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.deleteUserAppRole.bind(controller));

// GET - Buscar vínculo por ID
userAppRoleRouter.get("/:id", checkPermission("PERMISSOES", PermissionEnum.READ), controller.getUserAppRole.bind(controller));

// GET - Buscar vínculos com filtros
userAppRoleRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findUserAppRoles.bind(controller));

export default userAppRoleRouter;
