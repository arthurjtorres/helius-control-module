import { Router } from "express";
import AppRoleController from "../controllers/AppRoleController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const appRoleRouter = Router();

// Todas as rotas deste router exigem token JWT válido
appRoleRouter.use(verifyToken);
const controller = new AppRoleController();

// POST - Criar função de aplicativo
appRoleRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.createAppRole.bind(controller));

// PUT - Atualizar função por ID
appRoleRouter.put("/:id", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.updateAppRole.bind(controller));

// DELETE - Remover função por ID
appRoleRouter.delete("/:id", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.deleteAppRole.bind(controller));

// PATCH - Reativação (activated = true)
appRoleRouter.patch("/:id/reactivate", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.reactivateAppRole.bind(controller));

// GET - Buscar função por ID
appRoleRouter.get("/:id", checkPermission("PERMISSOES", PermissionEnum.READ), controller.getAppRole.bind(controller));

// GET - Buscar funções com filtros
appRoleRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findAppRoles.bind(controller));

export default appRoleRouter;
