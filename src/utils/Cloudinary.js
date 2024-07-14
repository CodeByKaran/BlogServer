import {v2 as Cloudinary} from "cloudinary"
import fs from "fs";


Cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret : process.env.API_SECRET
})


const uploadImage = async (localPath) => {
  try {
    const options = {
      resource_type: "image",
      upload_preset: "kkakunsigned" 
    };

    const res = await Cloudinary.uploader.upload(localPath, options);

    fs.unlink(localPath, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });
    
    return res;
  } catch (e) {
     if (fs.existsSync(localPath)) {
        fs.unlink(localPath, (err) => {
          if (err) console.error(`Error deleting file: ${err}`);
        });
      }
    return null;
  }
};


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