import mongoose,{Schema} from "mongoose"

const SaveSchema = new Schema({
   blogid:{
      type: Schema.Types.ObjectId,
      ref: "Blog"
   },
   usersaved:{
      type : Schema.Types.ObjectId,
      ref: "User"
   }
},{timestamps:true})


export const Save =  new mongoose.model("Save",SaveSchema)