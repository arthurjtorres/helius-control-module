import { Router } from "express";
import PermitController from "../controllers/PermitController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const permitRouter = Router();

// Todas as rotas deste router exigem token JWT válido
permitRouter.use(verifyToken);
const controller = new PermitController();

// POST - Criar permissão
permitRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.createPermit.bind(controller));

// PUT - Atualizar permissão
permitRouter.put("/:id", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.updatePermit.bind(controller));

// DELETE - Remover permissão
permitRouter.delete("/:id", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.deletePermit.bind(controller));

// PATCH - Reativação (activated = true)
permitRouter.patch("/:id/reactivate", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.reactivatePermit.bind(controller));

// GET - Buscar permissão por ID
permitRouter.get("/:id", checkPermission("PERMISSOES", PermissionEnum.READ), controller.getPermit.bind(controller));

// GET - Buscar permissões com filtro (via query)
permitRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findPermits.bind(controller));

export default permitRouter;
