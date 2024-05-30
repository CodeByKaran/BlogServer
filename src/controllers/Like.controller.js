import {Like} from "../models/Like.model.js"
import {Blog} from "../models/Blog.model.js"
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


const likeOnBlog=AsyncHandler(async(req,res)=>{
   const {blogId} = req.params
   
   const userId = req.user._id
   
   if(!blogId){
      return res
      .status(402)
      .send(
         new ApiError(402,"blogId not found")
      )
   }
   
   if(!userId){
      return res
      .status(402)
      .send(
         new ApiError(402,"userId not found")
      )
   }
   
  const isAlreadyLiked = await Like.find({likedto:blogId,likedby:userId})
   
   if(isAlreadyLiked.length){
   const dislike = await Like.deleteOne({likedby:userId,likedto:blogId})
  
   if(!dislike){
      return res
      .status(500)
      .send(
         new ApiError(402,"some error occured")
      )
   }
   
   return res.status(200)
     .json(
     new ApiResponse(200,dislike,"liked remove"))
     
   }else{
   const like = await Like.create({
      likedto: blogId,
      likedby: userId
    })
    
    if(!like){
      return res
      .status(500)
      .send(
         new ApiError(402,"some error occured")
      )
   }
   
     return res.status(200)
     .json(
     new ApiResponse(200,like,"liked"))
   
   }
   
})

export {
   likeOnBlog
}