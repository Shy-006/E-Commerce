import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";


const generateTokens = (userid) =>{
    const accesstoken = jwt.sign({userid},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m",
    });

     const refreshtoken = jwt.sign({userid},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d",
    });
    return {accesstoken,refreshtoken};
};
const storerefresh = async(userid,refreshtoken)=>{
    await redis.set(`refresh_token:${userid}`,refreshtoken,"EX",7*24*60*60*1000);
};

const setCookies = (res,accesstoken,refreshtoken)=>{
        res.cookie("accesstoken",accesstoken,{
            httpOnly:true, 
            secure : process.env.NODE_ENV==="production",
            samesite:"strict",//prevent csrf attack
            maxAge:15*60*1000,
        });
         res.cookie("refreshtoken",refreshtoken,{
            httpOnly:true, 
            secure : process.env.NODE_ENV==="production",
            samesite:"strict",//prevent csrf attack
            maxAge:7*24*60*60*1000,
        });
    };

export const signup = async (req,res)=>{
    const{email,password,name} = req.body;
    const userexist = await User.findOne({email});
    
    try{
        if(userexist){
        return res.status(400).json({message:"User already Exists"});
    }
    const user = await User.create({name,email,password});

    const{accesstoken,refreshtoken} =  generateTokens(user._id)
    await storerefresh(user._id,refreshtoken);

    setCookies(res,accesstoken,refreshtoken);

    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
    });
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

export const login = async (req,res)=>{
   try{
    const{email,password} = req.body;
    const user = await User.findOne({email});

    if(user && (await user.comparePassword(password))){
      const{accesstoken,refreshtoken} =   generateTokens(user._id);

      await storerefresh(user._id,refreshtoken);

      setCookies(res,accesstoken,refreshtoken);

      res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
      });
    }
    else{
        res.status(401).json({message:"Invalid email or password"});
    }
   }
   catch(err){
    res.status(500).json({message:err.message}); 
   }
};
export const logout = async (req,res)=>{
    try{
        const refreshtoken = req.cookies.refreshtoken;
        if(refreshtoken){
            const decoded = jwt.verify(refreshtoken,process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userid}`)
        }
        res.clearCookie("accesstoken");
        res.clearCookie("refreshtoken");
        res.json({message:"Logged out Successfulf"});
    }
    catch(err){
        res.status(500).json({message:"server error",error:err.message});
    }
};

export const refreshtoken = async(req,res)=>{
    
    try{
         const refreshtoken = req.cookies.refreshtoken;

     if(!refreshtoken){
        res.status(400).json({message:"No refresh Token provided"});
     }

     const decoded = jwt.verify(refreshtoken,process.env.REFRESH_TOKEN_SECRET);
     const storedtoken = await redis.get(`refresh_token:${decoded.userid}`);

     if(storedtoken !== refreshtoken){
        return res.status(400).son({message:"Invalid refres token"});
     }

     const accesstoken = jwt.sign({userid:decoded.userid},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m"
     });

      res.cookie("accesstoken",accesstoken,{
            httpOnly:true, 
            secure : process.env.NODE_ENV==="production",
            samesite:"strict",//prevent csrf attack
            maxAge:15*60*1000,
        });
        res.json({message:"Token refreshed successfull"});
    }
    catch(err){
        res.status(500).json({error:err.message,message:"Server Error"});
    }
};