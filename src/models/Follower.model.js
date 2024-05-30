import mongoose,{Schema} from "mongoose"

const FollowerSchema = new Schema(
   {
      followedto:{
         type:Schema.Types.ObjectId,
         ref:"User"
      },
      followedby:{
         type:Schema.Types.ObjectId,
         ref:"User"
      },
   },
   {
      timestamp:true
   }
)


export const Follower = new mongoose.model("Follower",FollowerSchema)