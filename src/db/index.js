import mongoose from "mongoose"


export const connect=async()=>{
   try {
   const instance = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
   console.log(`DB Connected ${instance.connection.host}`);
   } catch (e) {
      console.log(e);
      process.exit(2)
   }
}


