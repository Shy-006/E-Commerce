import { decode } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next)=>{
    
    try{
        const accesstoken = req.cookies.accesstoken;

        if(!accesstoken){
            res.status(401).json({message:"Unauthorised - No accesstoke provided"});
        }
       try {

         const decoded = jwt.verify(accesstoken,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userid).select("-password");

         if(!user){
            res.status(401).json({message:"User not found"});
        }
        req.user = user;
        next();
        
       } catch (err) {
        if(err.name ==="TokenExpiredError"){
             res.status(401).json({message:"Unauthorised -  accesstoken expired"});
        }
        throw err;
        
       }
    }
    catch(err){
        res.status(401).json({message:"unauthorised -Invaild access token"});
    }
}

export const adminRoute = (req,res,next)=>{
    if(req.user && req.user.role === "admin"){
        next();
    }
    else{
        return res.status(403).json({message:"Access Denied - admin only"});
    }
}