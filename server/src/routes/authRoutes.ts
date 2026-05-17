import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateLogin, validateRegister } from "../middleware/validate.js";

export const authRouter = Router();

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.get("/me", protect, me);
