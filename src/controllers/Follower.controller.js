import {Follower} from "../models/Follower.model.js"
import {User} from "../models/User.model.js"
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

import {
 uploadImage,
 deleteImageOnCloudinary,
 getPublicId
} from "../utils/Cloudinary.js"

import mongoose from "mongoose"


const followOnUser=AsyncHandler(async(req,res)=>{
   
   const userId = req.user?._id
   const {toUserId} = req.params
   
   if(!userId){
      return res
      .status(409)
      .send(new ApiError(409,"user is not logged"))
   }
   
   const follower = await Follower.create({
      followedto:toUserId,
      followedby: userId
   })
   
   if(!follower){
      return res
      .status(500)
      .send(new ApiError(500,"some error occured!"))
   }
   
   return res
   .status(200)
   .json(
    new ApiResponse(200,follower,"follwed")
   )
})


const unfollowUser=AsyncHandler(async(req,res)=>{
  const {userId} = req.params
   
   if(!userId){
      return res.status(402)
      .send(new ApiError(402,"user id not found"))
   }
   
  const acko = await Follower.deleteOne({followedto:userId,followedby:req.user?._id})
    
    return res.status(200)
    .json(
       new ApiResponse(200,acko,"unfollowed")
      )
   
})
   

export {
   followOnUser,
   unfollowUser
}