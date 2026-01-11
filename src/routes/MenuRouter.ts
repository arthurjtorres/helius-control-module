import { Router } from "express";
import MenuController from "../controllers/MenuController";
import { verifyToken } from "./middlewares/Authentication";

const menuRouter = Router();
const controller = new MenuController();

// POST - Criação de menu
menuRouter.post("/", verifyToken, controller.createMenu.bind(controller));

// PUT - Atualização de menu
menuRouter.put("/:id", verifyToken, controller.updateMenu.bind(controller));

// DELETE - Exclusão de menu por ID
menuRouter.delete("/:id", verifyToken, controller.deleteMenu.bind(controller));

// GET - Buscar menu por ID
menuRouter.get("/:id", controller.getMenu.bind(controller));

// GET - Buscar menus com filtros (query params)
menuRouter.get("/", controller.findMenus.bind(controller));

export default menuRouter;
