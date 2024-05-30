import {AsyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {hashPass} from "../helper/HashPass.helper.js"
import {comparePass} from "../helper/ComparePass.helper.js"
import {User} from "../models/User.model.js"
import {sendEmail} from "../utils/SendEmail.js"
import {generateOtp} from "../utils/OtpGen.js"
import {
 uploadImage,
 deleteImageOnCloudinary,
 getPublicId
} from "../utils/Cloudinary.js"

import mongoose from "mongoose"
import bcrypt from "bcryptjs"


const options={
  httpOnl:true,
  secured:true
}


const genRefreshAndAccessToken=async(userId)=>{
  try {
    const user = await User.findById(userId)

    const accessToken =  user.genAccessToken()
    const refreshToken =  user.genRefreshToken()

   await user.updateOne({
      refreshtoken: refreshToken,
      accesstoken: accessToken
   })

    return {accessToken,refreshToken}
    
  } catch (error) {
     throw new ApiError(500,error.message)
  }
}


const signUp = async (req, res) => {
  try {
    const { email, username, password,fullname } = req.body;

    if (!email || !username || !password || !fullname) {
      return res.status(402).send(new ApiError(402, "fields Are required"));
    }

    const isUserAlready = await User.find({ email });

    if (isUserAlready.length) {
      return res
        .status(402)
        .send(new ApiError(409, "User is already registered"));
    }

    const otp =  generateOtp()

    const expirytime = Date.now() + (1000 * 60 * 10);

    const isSent = await sendEmail(fullname,email,otp,`verify yourself \n OTP : ${otp}`,"kindly dont reply to this comment")
    
    if(!isSent){
      return res
      .status(500)
      .send("server error please signup again")
    }

    const signedUpuser = await User.create({
      username,
      email,
      fullname,
      password,
      otp,
      expirytime,
    });
    
    return res
      .status(200)
      .json(new ApiResponse(200, signedUpuser, "user SignUp Succesfuly")); 

  } catch (err) {
     console.log(err);
    return res.status(500).send(new ApiError(500, err.message));
  }

};



//verify user through Otp
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userOTP } = req.body;

    const user = await User.findById(id).select("-password -refreshtoken -otp -accesstoken");

    if (!user) {
      return res.status(402).send(new ApiError(409, "Id is not defined"));
    }

    if(user.isverify){
      return res
      .status(404)
      .send("user is alerady verified")
    }
     
    const isOtpValid = user.expirytime > Date.now();

    if (!isOtpValid) {
      return res.status(404).send(new ApiError(404, "Otp is Expired"));
    }
     
    
    if (user.otp != userOTP) {
      return res.status(402).send(new ApiError(402, "Wrong Otp"));
    }
     
   const acko = await user.updateOne({
       otp: null,
       expirytime:null,
       isverify : true
    })

    return res
      .status(200)
      .json(new ApiResponse(200, user, "successfully verifed"));

  } catch (err) {
   return res.status(500).send(new ApiError(500, err.message));
  }
};


//refresh Otp 
const refreshOtp = async (req, res) => {
  try {
    const {id} = req.params;

    const user = await User.findById(id).select("-password")

    if(!user){
        return res.status(404).send(new ApiError(404, "user not found"));
    }

    if(user.isVerified){
      return res
      .status(404)
      .send("user is alerady verified")
    } 

    const newOtp = generateOtp();
    const newotpExpirey = Date.now() + (1000 * 60 * 10)

    await user.updateOne({
       otp: newOtp,
       expirytime: newotpExpirey
    })
    
    await sendEmail(user.username,user.email,newOtp,`verify your otp is : ${newOtp} and only valid for ${new Date(user.expirytime).toLocaleString()}`,"kindly dont reply to this email!")

    return res.status(200).json(
        new ApiResponse(200,{},"otp refreshed")
    );

  } catch (err) {
     console.log(err);
    return res.status(500).send(new ApiError(500, err.message));
  }    
};


//loging in user
const loginUser= async(req,res)=>{

  try {
    const {email,password} = req.body
    
    const user = await User.findOne({email}).select("  -refreshtoken -accesstoken -otp -expirytime")
    
    
    if(!user){
      return res
      .status(402)
      .send(new ApiError(409,"invalid credentials"))
    }
    
    const isValidPass = await comparePass(password,user.password)

    if(!isValidPass){
      return res
      .status(402)
      .send(new ApiError(402,"password is wrong!"))

    }

    const {accessToken,refreshToken} = await genRefreshAndAccessToken(user._id)

    if(!accessToken || !refreshToken){
      return res
      .status(500)
      .send(new ApiError(500,"something went wrong while generating tokens"))

    }
   
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,user,"logged in"))

  } catch (err) {
    return res
    .status(500)
    .send(new ApiError(500,err.message))
  }

}


const updateAvatar=async(req,res)=>{

  try {
    const avatar = req.file?.path
    
    const user = await User.findById(req.user?._id)

    if(!avatar){
      return res
      .status(402)
      .send(new ApiError(402,"avatar not provided"))
    }
    
    
    if(user.avatar){
     const publicId = getPublicId(user.avatar)
     await deleteImageOnCloudinary(publicId)
    }

    const avatarURI = await uploadImage(avatar)
    
   const acko = await user.updateOne({
       avatar : avatarURI.secure_url
    })
   
    return res
    .status(200)
    .json(new ApiResponse(200,acko,"update successsfully"))

  } catch (error) {
    return res
    .status(500)
    .send(new ApiError(500,error.message))
  }

}


const resetPassswordSendOtp=async(req,res)=>{
  try {
    const { email } = req.body

    if(!email){
     return res
     .status(402)
     .send(new ApiError(402,"provide an email!"))
    }

    const user = await User.findOne({email:email}).select("-otp -password -accesstoken -refreshtoken -expirytime")

    if(!user){
      return res
      .status(409)
      .send(new ApiError(409,"email is not registered"))
    }
    
    const otp =  generateOtp()
    const expTime = Date.now() + (1000 * 60 * 10)
    
    await user.updateOne({
       otp: otp,
       expirytime: expTime
    })

    await sendEmail(user.username,email,otp,`your reset otp is : ${otp}`,"kindly dont reply to this comment")

    return res
    .status(200)
    .json(
      new ApiResponse(200,user,"rset code sent successfully")
    )

  } catch (error) {
    return res
    .status(500)
    .send(new ApiError(500,"something went wrong"))
  }
}


const verifyOtp=async(req,res)=>{
  try {
     const {otp} = req.body
     const {id} = req.params
     
     if(!otp || !id){
      return res
      .status(402)
      .send(new ApiError(402,"something you not providen!"))
     }

     const user = await User.findById(id)

     const isValidOtp = user.expirytime > Date.now();

     if(!isValidOtp){
      return res
      .status(400)
      .send(new ApiError(400,"otp expired"))
     }

     if(user.otp!=otp){
      return res
      .status(402)
      .send(new ApiError(402,"wrong credentials!"))
     }
     
     await user.updateOne({
       otp: null,
       expirytime:null,
       isverify : true
    })
     
     return res
     .status(200)
     .json(
      new ApiResponse(200,{},"otp verified")
     )
  } catch (error) {
    return res
    .status(500)
    .send(new ApiError(500,"something went wrong"))
  }
}

const changePassword=async(req,res)=>{
  try {
    const {newPass} = req.body
    const {id} = req.params
   
    const user = await User.findById(id)
    
    const isNotModifiedPass = await bcrypt.compare(newPass,user.password)
     
     
    if(isNotModifiedPass){
       return res 
       .status(402)
       .send(new ApiError(402,"new password should be different from current password"))
    }
   
    user.password = newPass
    await user.save({validateBeforeSave:false})

   
    return res
    .status(200)
    .json(
      new ApiResponse(200,{},"password reset successfully")
    )

  } catch (error) {
    return res
    .status(500)
    .send(new ApiError(500,"something went wrong"))
  }
}

const logOut = async(req,res)=>{
  try {
    const loggedUser = req.user

    if(!loggedUser){
      return res
      .status(409)
      .send(new ApiError(409,"something went wrong"))
    }

    const user = await User.findById(loggedUser._id)

    user.refreshToken=null
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"logged out"))

  } catch (error) {
    console.log(error);
    return res
    .status(500)
    .send(new ApiError(500,"something went wrong"))
  }
}


const getCurrentUser=async(req,res)=>{
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -registerOtp -otpExpirey -resetOtp')

    if(!user){
      return res
      .status(404)
      .send(new ApiError(404,"Session has expired"))
    }
     
    return res
    .status(200)
    .json(
      new ApiResponse(200,user,"user fetched successfully")
    )

  } catch (error) {
    return res
    .status(500)
    .send(new ApiError(500,err))
  }

}



// my routes
const deleteUser=AsyncHandler(async(req,res)=>{
   
   const user = await User.findById(req.user?._id)
   
   if(!user){
      return res 
      .status(409)
      .send(new ApiError(409,"user not found"))
   }
   
  const acko =  await User.deleteOne({_id:new mongoose.Types.ObjectId(user._id)})
   
  return res 
  .status(200)
  .json(
    new ApiResponse(200,acko,"deleted document!")
   )
   
})




export {
     signUp,
     verifyUser,
     refreshOtp,
     loginUser,
     updateAvatar,
     resetPassswordSendOtp,
     verifyOtp,
     changePassword,
     logOut,
     getCurrentUser,
     deleteUser
};