import {v2 as Cloudinary} from "cloudinary"
import fs from "fs"

Cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret : process.env.API_SECRET
})


const uploadImage=async(LocalPath)=>{
   try {
      const res = await Cloudinary.uploader.upload(LocalPath,{
       resource_type:"image"
      })
      fs.unlinkSync(LocalPath)
      return res
   } catch (e) {
      fs.unlinkSync(LocalPath)
      return null
   }
}


const deleteImageOnCloudinary=async(publicId)=>{
  try {
     const acko = await Cloudinary.api.delete_resources([publicId] , { type: "upload" , resource_type: "image" })
     .catch(err=>console.log("err ",err))
  } catch (e) {
     console.log("cErr ",e);
  }
}


const getPublicId=(URI)=>{
   return URI.split("/").pop().split(".")[0]
}




export {
   uploadImage,
   getPublicId,
   deleteImageOnCloudinary
}