import { Router } from "express";
import ClearanceLevelController from "../controllers/ClearanceLevelController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission, requireMinClearance } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";
import { ClearanceEnum } from "../database/models/enums/ClearanceEnum";

const clearanceLevelRouter = Router();

// Todas as rotas deste router exigem token JWT válido
clearanceLevelRouter.use(verifyToken);
const controller = new ClearanceLevelController();

// POST - Criar nível de acesso
clearanceLevelRouter.post("/", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.CREATE), controller.createClearanceLevel.bind(controller));

// PUT - Atualizar nível de acesso
clearanceLevelRouter.put("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.updateClearanceLevel.bind(controller));

// DELETE - Deletar nível de acesso
clearanceLevelRouter.delete("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.DELETE), controller.deleteClearanceLevel.bind(controller));

// PATCH - Reativação (activated = true)
clearanceLevelRouter.patch("/:id/reactivate", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.reactivateClearanceLevel.bind(controller));

// GET - Buscar nível de acesso por ID
clearanceLevelRouter.get("/:id", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.getClearanceLevel.bind(controller));

// GET - Buscar níveis de acesso com filtros
clearanceLevelRouter.get("/", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.findClearanceLevels.bind(controller));

export default clearanceLevelRouter;
