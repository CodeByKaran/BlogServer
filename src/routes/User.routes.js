import {Router} from "express"

import {
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
     deleteUser,
     getUserById
} from "../controllers/User.controller.js"
import {authUser,simpleAuth} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"


const router = Router()


router.route("/sign-up").post(upload.single('avatar'),signUp)
router.route("/verify/:id").post(verifyUser)




// secure Routes
router.route("/login").post(loginUser)

router.route("/update/avatar").put(upload.single('avatar'),authUser,updateAvatar)

router.route("/reset-pass/send/otp").post(resetPassswordSendOtp)

router.route("/reset-pass/verify/otp/:id").post(verifyOtp)

router.route("/reset-pass/password/change/:id").post(changePassword)

router.route("/log-out").get(authUser,logOut)

router.route("/refresh-otp/:id").post(refreshOtp)

router.route("/fetch").get(authUser,getCurrentUser)
router.route("/get/user").get(simpleAuth,getUserById)


//delete User
router.route("/delete").post(authUser,deleteUser)




export default router