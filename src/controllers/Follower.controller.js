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


const getFollowerOfUser=AsyncHandler(async(req,res)=>{
   
   const page = parseInt(req.query.page,10) || 1;
   const pageSize = parseInt(req.query.pageSize,10) || 10;
   const skip = (page-1) * pageSize
   
   const userId = req.query.userId || req.user._id;
   
   if(!userId){
      return res
       .status(400)
       .send(
         new ApiError(400,"User not provided")
     )
   }
   
   const userObjectId = new mongoose.Types.ObjectId(userId)
   
   const userFollower= await Follower.aggregate([
      {
         $match:{
            followedto: userObjectId
         }
      },
      {
         $lookup:{
            from:"users",
            localField:"followedby",
            foreignField:"_id",
            as:"user"
         }
      },
      {
         $lookup:{
            from:"followers",
            localField:"user._id",
            foreignField:"followedto",
            as:"followers"
         }
      },
      {
         $addFields:{
            isFollowed:{
               $cond:{
                  if:{
                     $in:[userObjectId,"$followers.followedby"]
                  },
                  then:true,
                  else:false
               }
            },
            user:{
               $first:"$user"
            },
            followers:{
               $size:"$followers"
            }
         }
      },
      {
         $project:{
            isFollowed:1,
            followers:1,
            _id:"$user._id",
            username:"$user.username",
            email:"$user.email",
            avatar:"$user.avatar",
            fullname:"$user.fullname",
         }
      },
      {
         $facet:{
        paginatedResults:[
          {
             $skip:skip
          },
          {
             $limit:pageSize
          }
         ],
        totalFollower:[{
           $count:"count"
        }]
      }
      },
      {
         $addFields:{
            totalFollower:{
               $arrayElemAt:["$totalFollower.count",0]
            }
         }
      },
      {
         $project:{
            totalFollower:1,
            paginatedResults:1,
         }
      }
   ])
   
   return res.status(200)
   .json(
     new ApiResponse(200,{
        result:userFollower[0].paginatedResults,
        totalResult:userFollower[0].totalFollower,
        page,
        pageSize
     },"Follower List fetched!")
   )
   
})



const getFollowingOfUser=AsyncHandler(async(req,res)=>{
   
   const page = parseInt(req.query.page,10) || 1;
   const pageSize = parseInt(req.query.pageSize,10) || 10;
   const skip = (page-1) * pageSize
   
   const userId = req.query.userId || req.user._id;
   
   if(!userId){
      return res
       .status(400)
       .send(
         new ApiError(400,"User not provided")
     )
   }
   
   const userObjectId = new mongoose.Types.ObjectId(userId)
   
   const userFollower= await Follower.aggregate([
      {
         $match:{
            followedby: userObjectId
         }
      },
      {
         $lookup:{
            from:"users",
            localField:"followedto",
            foreignField:"_id",
            as:"user"
         }
      },
      {
         $lookup:{
            from:"followers",
            localField:"user._id",
            foreignField:"followedby",
            as:"followers"
         }
      },
      {
         $addFields:{
            isFollowed:{
               $cond:{
                  if:{
                     $in:[userObjectId,"$followers.followedto"]
                  },
                  then:true,
                  else:false
               }
            },
            user:{
               $first:"$user"
            },
            followers:{
               $size:"$followers"
            }
         }
      },
      {
         $project:{
            isFollowed:1,
            followers:1,
            _id:"$user._id",
            username:"$user.username",
            email:"$user.email",
            avatar:"$user.avatar",
            fullname:"$user.fullname",
         }
      },
      {
         $facet:{
        paginatedResults:[
          {
             $skip:skip
          },
          {
             $limit:pageSize
          }
         ],
        totalFollower:[{
           $count:"count"
        }]
      }
      },
      {
         $addFields:{
            totalFollower:{
               $arrayElemAt:["$totalFollower.count",0]
            }
         }
      },
      {
         $project:{
            totalFollower:1,
            paginatedResults:1,
         }
      }
   ])
   
   return res.status(200)
   .json(
     new ApiResponse(200,{
        result:userFollower[0].paginatedResults,
        totalResult:userFollower[0].totalFollower,
        page,
        pageSize
     },"Following List fetched!")
   )
   
})
   



export {
   followOnUser,
   unfollowUser,
   getFollowerOfUser,
   getFollowingOfUser
}