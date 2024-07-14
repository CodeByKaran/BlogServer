import mongoose,{Schema} from "mongoose"


const CommentSchema = new Schema(
   {
      commentto:{
         type:Schema.Types.ObjectId,
         ref:"Blog"
      },
      commentby:{
         type:Schema.Types.ObjectId,
         ref:"User"
      },
      content:{
         type:String,
         required:true,
         trim:true
      },
   },
   {
      timestamps:true
   }
   )
   

export const Comment = new mongoose.model("Comment",CommentSchema)