import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import authroutes from "./routes/auth.route.js";
import productroutes from "./routes/product.route.js";
import { connectdb } from "./lib/db.js";



const app = express();
const PORT = process.env.PORT||5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authroutes);
app.use("/api/product",productroutes);

app.listen(PORT,()=>{
    console.log(`port running on:${PORT}`);
    connectdb();
});


