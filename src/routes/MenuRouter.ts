import { Router } from "express";
import MenuController from "../controllers/MenuController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission, requireMinClearance } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";
import { ClearanceEnum } from "../database/models/enums/ClearanceEnum";

const menuRouter = Router();

// Todas as rotas deste router exigem token JWT válido
menuRouter.use(verifyToken);
const controller = new MenuController();

// POST - Criação de menu
menuRouter.post("/", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.CREATE), controller.createMenu.bind(controller));

// PUT - Atualização de menu
menuRouter.put("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.updateMenu.bind(controller));

// DELETE - Exclusão de menu por ID
menuRouter.delete("/:id", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.DELETE), controller.deleteMenu.bind(controller));

// PATCH - Reativação (activated = true)
menuRouter.patch("/:id/reactivate", requireMinClearance(ClearanceEnum.ADMIN), checkPermission("ESTRUTURA", PermissionEnum.UPDATE), controller.reactivateMenu.bind(controller));

// GET - Buscar menu por ID
menuRouter.get("/:id", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.getMenu.bind(controller));

// GET - Buscar menus com filtros (query params)
menuRouter.get("/", checkPermission("ESTRUTURA", PermissionEnum.READ), controller.findMenus.bind(controller));

export default menuRouter;
