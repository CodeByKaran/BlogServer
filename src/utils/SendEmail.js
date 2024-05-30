import nodemailer from "nodemailer";
import Mailgen from 'mailgen'



const config={
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user: process.env.EMAIL ,
        pass: process.env.EMAIL_PASS
    }
}

let transporter = nodemailer.createTransport(config)


let mailGenerator = new Mailgen({
  theme: 'default',
  product:{
     name: "DoBlog",
     link: "http://localhost:5173"
  }
});


export const sendEmail = async(name,userEmail,otp,intro,outro)=> {

  let email = {
    body: {
        name: name,
        intro: intro,
        outro: outro
    }
  };
  
  let emailBody = mailGenerator.generate(email);
  
  let emailText = mailGenerator.generatePlaintext(email);
  
 
  let message = {
    from:process.env.EMAIL,
    to:userEmail,
    subject:"Verification",
    text:emailText,
    html:emailBody
  }

  try{
    await transporter.sendMail(message)
    return 1
  }catch(err){
     console.log(err);
    return 0
  }

}