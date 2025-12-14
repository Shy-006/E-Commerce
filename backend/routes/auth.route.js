import express from "express";
import { Router } from "express";
import { login, logout, signup ,refreshtoken } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login",login );
router.post("/logout",logout );
router.post("/refresh-token",refreshtoken );
// router.post("/refresh-token",protectedRoute,getprofile );

export default router;