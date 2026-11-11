import { Router } from "express";
import UserModuleController from "../controllers/UserModuleController";
import { verifyToken } from "../middlewares/Authentication";
import { checkPermission } from "../middlewares/CheckPermission";
import { PermissionEnum } from "../database/models/enums/PermissionEnum";

const userModuleRouter = Router();

// Todas as rotas deste router exigem token JWT válido
userModuleRouter.use(verifyToken);
const controller = new UserModuleController();

// POST - Criar vínculo usuário-módulo
userModuleRouter.post("/", checkPermission("PERMISSOES", PermissionEnum.CREATE), controller.createUserModule.bind(controller));

// PUT - Atualizar vínculo por ID
userModuleRouter.put("/:id", checkPermission("PERMISSOES", PermissionEnum.UPDATE), controller.updateUserModule.bind(controller));

// DELETE - Deletar vínculo por ID
userModuleRouter.delete("/:id", checkPermission("PERMISSOES", PermissionEnum.DELETE), controller.deleteUserModule.bind(controller));

// GET - Buscar vínculo por ID
userModuleRouter.get("/:id", checkPermission("PERMISSOES", PermissionEnum.READ), controller.getUserModule.bind(controller));

// GET - Buscar vínculos com filtros (query params)
userModuleRouter.get("/", checkPermission("PERMISSOES", PermissionEnum.READ), controller.findUserModules.bind(controller));

export default userModuleRouter;
