import product from "../models/product.model.js"

export const getAllProducts = async(req,res)=>{
    try{
        const products = await product.find({});
        res.json({products});
    }
    catch(err){
        res.status(500).json({message:"Server Error",error:err.message});
    }
}