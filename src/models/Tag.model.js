import mongoose,{Schema} from "mongoose"


const TagSchema = new Schema(
   {
      tagto:{
         type:Schema.Types.ObjectId,
         ref:"Blog"
      }
      tagby:{
         type:Schema.Types.ObjectId,
         ref:"User"
      }
   },
   {
      timestamps:true
   }
)


export const Tag = new mongoose.model("Tag",TagSchema)