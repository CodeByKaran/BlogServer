import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


const UserSchema = new Schema({
   username:{
      type:String,
      trim:true,
      lowerCase:true,
      required:true,
      unique:true
   },
   fullname:{
      type:String,
      trim:true,
      required:true
   },
   email:{
      type:String,
      unique:true,
      required:true,
      lowerCase:true
   },
   avatar:{
      type:String,
   },
   coverimage:{
      type:String
   },
   password:{
      type:String
   },
   tags:{
      type:Array,
      default:["cool"]
   },
   bio:{
      type:String,
      default:"Hello , Make Sure You Follow Me"
   },
   isverify:{
      type:Boolean,
      default:false
   },
   role:{
      type:String,
      default:"user"
   },
   otp:{
      type:Number,
      default:0
   },
   expirytime:{
      type:Number,
      default:0
   },
   accesstoken:{
      type:"String"
   },
   refreshtoken:{
      type:String
   },
   googleId:{
      type: String
   }
},{
   timestamps:true
})

UserSchema.pre("save",async function(next){
   if(!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password,10)
   next()
})


UserSchema.methods.genRefreshToken=function(){
   return jwt.sign(
   {
      _id:this._id
   },
   process.env.REF_TOKEN_SECRET,
   {
      expiresIn:process.env.REF_TOKEN_EXP
   }
   )
}


UserSchema.methods.genAccessToken=function(){
   return jwt.sign(
   {
      _id:this._id
   },
   process.env.ACC_TOKEN_SECRET,
   {
      expiresIn:process.env.ACC_TOKEN_EXP
   }
   )
}

UserSchema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});


export const User = mongoose.model("User",UserSchema)
