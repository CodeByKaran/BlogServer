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
   
   if(!content){
      return res
      .status(402)
      .send(
         new ApiError(402,"content is required !")
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

const getComments = AsyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pagesize, 10) || 3;
    const skip = (page - 1) * pageSize;
    
    
    
    const BlogComment = await Comment.aggregate([
        {
            $match: {
                commentto:new mongoose.Types.ObjectId(blogId)
            }
        },
        {
            $lookup:{
               from: "users",
               localField: "commentby",
               foreignField:"_id",
               as: "user"
            }
         },
        {
            $addFields:{
               user:{
                  $first:"$user"
               },
               isEditable:{
                  $eq:[req.user?._id,"$commentby"]
               }
            }
         },
        {
           $project:{
              username:"$user.username",
              avatar: "$user.avatar",
              userId: "$user._id",
              isEditable:1,
              commentto : 1,
              commentby : 1,
              content: 1,
              createdAt: 1,
              updatedAt: 1
           }
        },
        {
           $lookup:{
              from:"followers",
              localField:"commentby",
              foreignField:"followedto",
              as: "totalFollowers"
           }
        },
        {
           $addFields:{
              totalFollowers:{
                 $size:"$totalFollowers"
              }
           }
        },
        {
           $skip:skip
        },
        {
           $limit:pageSize
        }
    ]);
    
    return res.json(
        new ApiResponse(200, { comments: BlogComment}, "Comments fetched successfully")
    );
});


export {
   commentOnBlog,
   deleteComment,
   editComment,
   getComments
}