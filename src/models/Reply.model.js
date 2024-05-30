import mongoose,{Schema} from "mongoose"


const ReplySchema = new Schema(
   {
      repliedto:{
         type:Schema.Types.ObjectId,
         ref:"Comment"
      },
      repliedby:{
         type:Schema.Types.ObjectId,
         ref:"User"
      }
   },
   {
      timestamps:true
   }
)


export const Reply = new mongoose.model("Reply",ReplySchema)