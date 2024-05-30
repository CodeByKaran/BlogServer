import bcrypt from "bcryptjs"


export const hashPass=async(pass)=>{
   const H_P = await bcrypt.hash(pass,10)
   return H_P
}