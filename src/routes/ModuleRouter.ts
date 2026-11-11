import { Router } from "express";
import ModuleController from "../controllers/ModuleController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission, requireMinClearance } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";
import { ClearanceEnum } from "../database/models/enums/ClearanceEnum";

const moduleRouter = Router();

// Todas as rotas deste router exigem token JWT válido
moduleRouter.use(verifyToken);
const controller = new ModuleController();

// POST - Criação de módulo
moduleRouter.post("/", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.CREATE), controller.createModule.bind(controller));

// PUT - Atualização de módulo (ID na URL, dados no body)
moduleRouter.put("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.updateModule.bind(controller));

// DELETE - Exclusão de módulo por ID (via URL param)
moduleRouter.delete("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.DELETE), controller.deleteModule.bind(controller));

// PATCH - Reativação (activated = true)
moduleRouter.patch("/:id/reactivate", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.reactivateModule.bind(controller));

// GET - Buscar módulo por ID (via URL param)
moduleRouter.get("/:id", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.getModule.bind(controller));

// GET - Buscar módulos com filtros (via query params)
moduleRouter.get("/", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.findModules.bind(controller));

export default moduleRouter;
