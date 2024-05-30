import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"


export const googleProfile=AsyncHandler(async(req,res)=>{
   return res.status(200)
   .send(new ApiResponse(200,req.user,"user logged"))
})