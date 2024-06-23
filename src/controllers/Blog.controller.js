import {Blog} from "../models/Blog.model.js"
import {Follower} from "../models/Follower.model.js"
import {User} from "../models/User.model.js"
import {Save} from "../models/Save.model.js"
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

import {
 uploadImage,
 deleteImageOnCloudinary,
 getPublicId
} from "../utils/Cloudinary.js"

import mongoose from "mongoose"


const uploadBlog = async(req,res)=>{
   try {
   const user = await User.findById(req.user?._id)
   
   if(!user){
      return res
      .status(409)
      .send(
       new ApiError(409,"User should be logged")
      )
   }
   
   const {content,tags} = req.body
   const con_image = req.file?.path
   
   if(!content){
      return res
      .status(402)
      .json(
         new ApiError(402,"caption is requiured !")
       )
   }
   
   if(!con_image){
      return res
      .status(409)
      .send(
       new ApiError(409,"conten image is required!")
      )
   }
   
   const contentimg = await uploadImage(con_image)
   
   if(!contentimg){
      return res
      .status(500)
      .send(
       new ApiError(500,"please try again with proper name of file")
      )
   }
   
   const blog = await Blog.create({
      owner : user._id,
      content : content ,
      tags: tags,
      contentimg : contentimg.secure_url
   })
   
   return res
      .status(200)
      .json(
       new ApiResponse(200,blog,"blog uploaded!")
      )
      
   } catch (e) {
      return res
      .status(500)
      .send(
         new ApiError(500,e.message)
      )
   }
}

const deletBlog = async(req,res)=>{
   try {
      const {id} = req.params
      
      const blog = await Blog.findById(id)
      
      const publicId = getPublicId(blog.contentimg)
      
     const delImgAcko = await deleteImageOnCloudinary(publicId)
      
      const acko =  await Blog.deleteOne({_id:new mongoose.Types.ObjectId(id)})
      
      if(acko.deletedCount==0){
      return res
      .status(400)
      .send(
       new ApiError(400,"blog is already deleted or id is incorrect")
      )
      }
      
      return res
      .status(200)
      .json(
        new ApiResponse(200,acko,"blog deleted")
      )
      
   } catch (e) {
      return res
      .status(500)
      .send(
       new ApiError(500,e.message)
      )
   }
}

const getSingleBlog = async(req,res)=>{
   try {
     const {id} = req.params
     
     const blog = await Blog.aggregate([
    {
        $lookup: {
            from: "followers",
            localField: "owner",
            foreignField: "followedto",
            as: "followers"
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "userByBlog"
        }
    },
    {
        $addFields: {
            userByBlog: { $arrayElemAt: ["$userByBlog", 0] },
            isFollowed: {
                $cond: {
                    if: { $in: [req.user?._id, "$followers.followedby"] },
                    then: true,
                    else: false
                }
            },
            followersCount: { $size: "$followers" }
        }
    },
    {
        $project: {
            fullname: "$userByBlog.fullname",
            avatar: "$userByBlog.avatar",
            username: "$userByBlog.username",
            tagline: "$userByBlog.tagline",
            contentimg: 1,
            content: 1,
            followersCount: 1,
            isFollowed: 1,
            createdAt: 1,
            updatedAt: 1,
            owner: 1
        }
    },
    {
        $lookup: {
            from: "comments",
            let: { blogId: "$_id" },
            pipeline: [
                { $match: { $expr: { $eq: ["$commentto", "$$blogId"] } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "commentby",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $addFields: {
                        user: { $arrayElemAt: ["$user", 0] },
                        editable: { $eq: [req.user?._id, "$commentby"] }
                    }
                },
                {
                    $project: {
                        username: "$user.username",
                        fullname: "$user.fullname",
                        content: 1,
                        avatar: "$user.avatar",
                        editable: 1
                    }
                }
            ],
            as: "comments"
        }
    },
    {
        $lookup: {
            from: "saves",
            localField: "_id",
            foreignField: "blogid",
            as: "saves"
        }
    },
    {
        $addFields: {
            isSaved: {
                $cond: {
                    if: { $in: [req.user?._id, "$saves.usersaved"] },
                    then: true,
                    else: false
                }
            },
            saves: { $size: "$saves" }
        }
    },
    {
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "likedto",
            as: "likes"
        }
    },
    {
        $addFields: {
            likes: { $size: "$likes" },
            commentsCount: { $size: "$comments" },
            isLiked: {
                $cond: {
                    if: { $in: [req.user?._id, "$likes.likedby"] },
                    then: true,
                    else: false
                }
            }
        }
    }
]);
     
     if(!blog.length){
        return res
      .status(404) 
      .send(
       new ApiError(404,"blog is deleted or may not found!")
      )
     }
     
     return res
      .status(200)
      .json(
       new ApiResponse(200,blog[0],"blog fetched")
      )
      
   } catch (e) {
      return res
      .status(500)
      .send(
       new ApiError(500,e.message)
      )
   }
}


const getBlog = AsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;
    

    const blog = await Blog.aggregate([
        {
            $match: {
            }
        },
        {
            $lookup: {
                from: "followers",
                localField: "owner",
                foreignField: "followedto",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userByBlog",
            }
        },
        {
            $addFields: {
                userByBlog: { $first: "$userByBlog" },
                isFollowed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followers.followedby"] },
                        then: true,
                        else: false
                    }
                },
                followers: { $size: "$followers" }
            }
        },
        {
            $project: {
                fullname: "$userByBlog.fullname",
                avatar: "$userByBlog.avatar",
                username: "$userByBlog.username",
                tagline: "$userByBlog.tagline",
                contentimg: 1,
                content: 1,
                followers: 1,
                isFollowed: 1,
                createdAt: 1,
                updatedAt: 1,
                owner:1
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "commentto",
                as: "comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "commentby",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $addFields: {
                            user: { $first: "$user" },
                            editable: { $eq: [req.user?._id, "$user._id"] }
                        }
                    },
                    {
                        $project: {
                            username: "$user.username",
                            fullname: "$user.fullname",
                            content: 1,
                            avatar: "$user.avatar",
                            editable: 1
                        }
                    }
                ]
            }
        },
        {
         $lookup:{
            from : "saves",
            localField: "_id",
            foreignField: "blogid",
            as: "saves"
         }
        },
        {
           $addFields:{
              isSaved:{
                 $cond:{
                    if:{
                       $in:[req.user?._id,"$saves.usersaved"]
                    },
                    then: true,
                    else: false
                 }
              },
                saves: {
                 $size: "$saves"
              }
           }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedto",
                as: "likes",
            }
        },
        {
            $addFields: {
                likes: { $size: "$likes" },
                comments: { $size: "$comments" },
                isLiked:{
                   $cond:{
                      if:{
                         $in:[req.user?._id,"$likes.likedby"]
                      },
                      then:true,
                      else:false
                   }
                }
            }
        },
        {
            $skip: skip
        },
        {
            $limit: pageSize
        }
    ]);

    const totalBlog = await Blog.countDocuments({}); 

    return res.status(200).json(
        new ApiResponse(200, { page, pageSize, totalBlog, blogs: blog }, "Blog fetched")
    );
});



export {
   uploadBlog,
   deletBlog,
   getSingleBlog,
   getBlog
}