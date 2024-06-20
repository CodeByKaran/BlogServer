import {User} from "../models/User.model.js"
import jwt from "jsonwebtoken"
import {ApiError} from "../utils/ApiError.js"
import passport from "passport"


export const authUser=async(req,res,next)=>{
   try {
     const token = req.cookies?.refreshToken|| req.header('Authorization')?.replace("Bearer ","")
     
     if(!token){
        return res.status(500)
        .send(new ApiError(409,"User Must Be Logged In"))
     }
     
     const decodedToken = await jwt.verify(token,process.env.REF_TOKEN_SECRET)
     
     if(!decodedToken){
        return res.status(500)
        .send(new ApiError(500,"invaild token!"))
     }
     
     const user = await User.findById(decodedToken._id)
     
     if(!user){
        return res.status(404)
        .send(new ApiError(404,"user not found"))
     }
     
     req.user = user
     next()
     
   } catch (e) {
      next(e)
   }
}

export const simpleAuth=async(req,res,next)=>{
   try {
     const token = req.cookies?.refreshToken|| req.header('Authorization')?.replace("Bearer ","")
     
     if(!token){
        next()
        return
     }
     
     const decodedToken = await jwt.verify(token,process.env.REF_TOKEN_SECRET)
     
     if(!decodedToken){
        next()
        return
     }
     
     const user = await User.findById(decodedToken._id)
     
     if(!user){
        next()
        return
     }
     
     req.user = user
     next()
     
   } catch (e) {
      next(e)
   }
}

