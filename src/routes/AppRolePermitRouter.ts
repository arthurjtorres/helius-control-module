import { Router } from "express";
import AppRolePermitController from "../controllers/AppRolePermitController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const appRolePermitRouter = Router();

// Todas as rotas deste router exigem token JWT válido
appRolePermitRouter.use(verifyToken);
const controller = new AppRolePermitController();

// POST - Criar associação de papel e permissão
appRolePermitRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.createAppRolePermit.bind(controller));

// PUT - Atualizar associação por ID
appRolePermitRouter.put("/:id", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.updateAppRolePermit.bind(controller));

// DELETE - Remover associação por ID
appRolePermitRouter.delete("/:id", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.deleteAppRolePermit.bind(controller));

// GET - Buscar associação por ID
appRolePermitRouter.get("/:id", checkPermission("PERMISSOES", PermissionEnum.READ), controller.getAppRolePermit.bind(controller));

// GET - Buscar associações com filtros (query params)
appRolePermitRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findAppRolePermits.bind(controller));

export default appRolePermitRouter;
