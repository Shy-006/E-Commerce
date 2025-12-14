import mongoose from "mongoose";
export const connectdb = async ()=>{

    try{
      const conn = await mongoose.connect(process.env.MONGO_URI );
        console.log("connected to database");
    }
   catch(err){
    console.log(`Error:${err}`);
    process.exit(1);
   }
}
