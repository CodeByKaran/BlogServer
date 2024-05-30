import bcrypt from "bcryptjs"


export const comparePass=async(pass,hashPass)=>{
   const Is = await bcrypt.compare(pass,hashPass)
   return Is
}