import express from "express";
import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/",protectRoute,adminRoute,getAllProducts);
export default router;
