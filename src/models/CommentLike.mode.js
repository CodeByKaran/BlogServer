import mongoose,{Schema} from "mongoose"


const CommentLike = new Schema({
   commenttolike:{
      type: Schema.Types.ObjectId,
      ref:"Comment"
   },
   commentlikeby:{
      type: Schema.Types.ObjectId,
      ref:"User"
   }
},
{
   timestamps:true
})


export const CLike = new mongoose.model("CLike",CommentLike)