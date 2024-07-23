import { Save } from "../models/Save.model.js";
import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const saveBlog = AsyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(409).send(new ApiError(409, "blog id is not defined !"));
  }

  const saved = await Save.create({
    blogid: blogId,
    usersaved: req.user?._id
  });

  return res.status(200).json(new ApiResponse(200, saved, "blog saved !"));
});

const removeSavedBlog = AsyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(409).send(new ApiError(409, "blog id is not defined !"));
  }

  const acko = await Save.deleteOne({ blogid: blogId });

  return res.status(200).json(new ApiResponse(200, acko, "blog removed !"));
});

const getSavedBlog = AsyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize, 10) || 5;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = parseInt(page - 1) * pageSize;
  const user = new mongoose.Types.ObjectId(req.user?._id);
 

  const result = await Save.aggregate([
    {
      $match:{
         usersaved: user
      }
    },
    {
       $lookup:{
          from: "blogs",
          localField:"blogid",
          foreignField:"_id",
          as:"blogs"
       }
    },
    {
       $lookup:{
          from: "users",
          localField:"blogs.owner",
          foreignField:"_id",
          as:"user" 
       }
    },
    {
       $lookup:{
          from: "comments",
          localField:"blogs._id",
          foreignField:"commentto",
          as:"comments" 
       }
    },
    {
       $lookup:{
          from: "followers",
          localField:"user._id",
          foreignField:"followedto",
          as:"followers" 
       }
    },
    {
       $lookup:{
          from: "likes",
          localField:"blogs._id",
          foreignField:"likedto",
          as:"likes" 
       }
    },
    {
       $lookup:{
          from: "saves",
          localField:"blogs._id",
          foreignField:"blogid",
          as:"saves" 
       }
    },
    {
       $addFields:{
         isFollowed:{
           $cond:{
              if : {
               $in:[user,"$followers.followedby"]  
              },
              then: true,
              else: false
           }
         },
         followers:{
            $size:"$followers"
         },
         isLiked:{
           $cond:{
              if : {
               $in:[user,"$likes.likedby"]  
              },
              then: true,
              else: false
           }            
         },
         likes:{
            $size: "$likes"
         },
         isSaved:{
           $cond:{
              if : {
               $in:[user,"$saves.usersaved"]  
              },
              then: true,
              else: false
           }            
         },
         saves:{
            $size:"$saves"
         },
         comments:{
            $size:"$comments"
         },
         user:{
            $first:"$user"
         },
         blogs:{
            $first:"$blogs"
         }
       }
    },
    {
       $project:{
         _id:"$blogs._id",
         fullName:"$user.fullName", 
         username:"$user.username", 
         email:"$user.email", 
         avatar:"$user.avatar",
         tagline:"$user.tagline",
         contentimg: "$blogs.contentimg",
         content: "$blogs.content",
         followers: 1,
         isFollowed: 1,
         likes: 1,
         isLiked:1,
         comments:1,
         saves:1,
         isSaved:1,
         createdAt:"$blogs.createdAt",
         updatedAt:"$blog.updatedAt"
       }
    },
    {
       $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: pageSize }],
        totalBlogCount: [
          {
            $count: "count"
          }
        ]
      }
    },
    {
      $addFields: {
        totalBlogCount: {
          $arrayElemAt: ["$totalBlogCount.count", 0]
        }
      }
    },    
    {
       $project:{
          paginatedResults:1,
          totalBlogCount: { $ifNull: ["$totalBlogCount", 0] }
       }
    }
  ]);

    
   return res
   .status(200)
   .json(
      new ApiResponse(200,       
      {
          page,
          pageSize,
          blogs: result[0]?.paginatedResults || [],
          totalBlogCount: result[0]?.totalBlogCount || 0
        },"saved blogs fetched ")
    )
});


export { saveBlog, removeSavedBlog, getSavedBlog };
