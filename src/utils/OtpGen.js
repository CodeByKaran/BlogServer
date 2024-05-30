import OtpGenerator from "otp-generator";

export const generateOtp=()=>{
    return OtpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
}