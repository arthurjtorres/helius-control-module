import { Router } from "express";
import ClearanceLevelController from "../controllers/ClearanceLevelController";
import { verifyToken } from "../middlewares/Authentication";

const clearanceLevelRouter = Router();
const controller = new ClearanceLevelController();

// POST - Criar nível de acesso
clearanceLevelRouter.post("/", verifyToken, controller.createClearanceLevel.bind(controller));

// PUT - Atualizar nível de acesso
clearanceLevelRouter.put("/:id", verifyToken, controller.updateClearanceLevel.bind(controller));

// DELETE - Deletar nível de acesso
clearanceLevelRouter.delete("/:id", verifyToken, controller.deleteClearanceLevel.bind(controller));

// GET - Buscar nível de acesso por ID
clearanceLevelRouter.get("/:id", controller.getClearanceLevel.bind(controller));

// GET - Buscar níveis de acesso com filtros
clearanceLevelRouter.get("/", controller.findClearanceLevels.bind(controller));

export default clearanceLevelRouter;
