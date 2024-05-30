import mongoose,{Schema} from "mongoose"


const LikeSchema = new Schema(
   {
      likedto:{
         type:Schema.Types.ObjectId,
         ref:"Blog"
      },
      likedby:{
         type:Schema.Types.ObjectId,
         ref:"User"
      }
   },
   {
      timestamps:true
   }
)


export const Like = new mongoose.model("Like",LikeSchema)