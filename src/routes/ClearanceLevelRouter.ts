import { Router } from "express";
import ClearanceLevelController from "../controllers/ClearanceLevelController";
import { verifyToken } from "../middlewares/Authentication";

const clearanceLevelRouter = Router();

// Todas as rotas deste router exigem token JWT válido
clearanceLevelRouter.use(verifyToken);
const controller = new ClearanceLevelController();

// POST - Criar nível de acesso
clearanceLevelRouter.post("/", controller.createClearanceLevel.bind(controller));

// PUT - Atualizar nível de acesso
clearanceLevelRouter.put("/:id", controller.updateClearanceLevel.bind(controller));

// DELETE - Deletar nível de acesso
clearanceLevelRouter.delete("/:id", controller.deleteClearanceLevel.bind(controller));

// PATCH - Reativação (activated = true)
clearanceLevelRouter.patch("/:id/reactivate", controller.reactivateClearanceLevel.bind(controller));

// GET - Buscar nível de acesso por ID
clearanceLevelRouter.get("/:id", controller.getClearanceLevel.bind(controller));

// GET - Buscar níveis de acesso com filtros
clearanceLevelRouter.get("/", controller.findClearanceLevels.bind(controller));

export default clearanceLevelRouter;
