import {Comment} from "../models/Comment.model.js"
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


const commentOnBlog=AsyncHandler(async(req,res)=>{
   const {blogId} = req.params
   const userId = req.user?.id
   const {content} = req.body
   
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
   
   const comment = await Comment.create({
      commentto: blogId,
      commentby: userId,
      content: content
   })
   
   if(!comment){
      return res
      .status(500)
      .send(
         new ApiError(402,"some error occured")
      )
   }
   
   return res
   .status(200)
   .json(
      new ApiResponse(200,comment,"commented")
   )
})

const deleteComment=AsyncHandler(async(req,res)=>{
   
   const {commentId} = req.params
   
   const comment = await Comment.findById(commentId)
   
   if(!(req.user._id.equals(comment.commentby))){
      return res.status(409)
      .send(new ApiError(409,"user not authorized"))
   }
   
   const acko = await Comment.deleteOne({_id:new mongoose.Types.ObjectId(commentId)})
   
   return res
   .status(200)
   .json(new ApiResponse(200,acko,"deleted"))
})

const editComment=AsyncHandler(async(req,res)=>{
   const {commentId} = req.params
   const {editContent} = req.body
   
   const comment = await Comment.findById(commentId)
   
   if(!(req.user._id.equals(comment.commentby))){
      return res.status(400).send(new ApiError(400,"user not authorized!"))
   }
   
  const acko =  await comment.updateOne({
      content: editContent
   })
   
   return res.status(200)
   .json(
     new ApiResponse(200,acko,"edited comment!")
   )
})


export {
   commentOnBlog,
   deleteComment,
   editComment
}