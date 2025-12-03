import { Router } from "express";

import userRouter from "./UserRouter";
import moduleRouter from "./ModuleRouter";
import menuRouter from "./MenuRouter";
import appRoleRouter from "./AppRoleRouter";
import permitRouter from "./PermitRouter";
import clearanceLevelRouter from "./ClearanceLevelRouter";
import appRolePermitRouter from "./AppRolePermitRouter";
import userAppRoleRouter from "./UserAppRoleRouter";
import userModuleRouter from "./UserModuleRouter";
import authRouter from "./AuthRouter";

const router = Router();
router.use("/auth", authRouter);

router.use("/users", userRouter);
router.use("/modules", moduleRouter);
router.use("/menus", menuRouter);
router.use("/app-roles", appRoleRouter);
router.use("/permits", permitRouter);
router.use("/clearance-levels", clearanceLevelRouter);
router.use("/app-role-permits", appRolePermitRouter);
router.use("/user-app-roles", userAppRoleRouter);
router.use("/user-modules", userModuleRouter);

export default router;