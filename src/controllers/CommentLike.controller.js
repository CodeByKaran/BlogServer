import {User} from "../models/User.model.js"
import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {CLike} from "../models/CommentLike.mode.js"


const likeComments=AsyncHandler(async(req,res)=>{
   const userId = req.user?._id
   const {cId} = req.params
   
   if([userId,cId].some(e=>e==null)){
      return res.status(400)
      .send(new ApiError(400,{},"Invaild Id !"))
   }
   
   const acko = await CLike.create({
      commenttolike:cId,
      commentlikeby: userId
   })
   
   return res.status(200)
   .json(new ApiResponse(200,acko,"comment liked !"))
   
})


const unlikeComments=AsyncHandler(async(req,res)=>{
   const userId = req.user?._id
   const {cId} = req.params
   
   if([userId,cId].some(e=>e==null)){
      return res.status(400)
      .send(new ApiError(400,{},"Invaild Id !"))
   }
   
   const acko = await CLike.deleteOne({
      commenttolike:cId,
      commentlikeby: userId
   })
   
   return res.status(200)
   .json(new ApiResponse(200,acko,"comment Like has retrived!"))
})



export {
   likeComments,
   unlikeComments
}