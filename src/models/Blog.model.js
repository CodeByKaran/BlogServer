import mongoose,{Schema} from "mongoose"

const BlogSchema = new Schema(
   {
    owner:{
       type:Schema.Types.ObjectId,
       ref:"User"
    },
    contentimg:{
       type:String,
    },
    content:{
       type:String,
       trim:true,
    },
    tags:{
       type: Array,
       default: []
    }
   },
   {
  timestamps:true 
   }
)

export const Blog = new mongoose.model("Blog",BlogSchema)