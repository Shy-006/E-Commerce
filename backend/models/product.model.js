import mongoose from "mongoose";

const productschema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isFeatured:{
        type:Boolean,
        default:false
    }
},
{timestamp:true});

const product = mongoose.model("product",productschema);

export default product;