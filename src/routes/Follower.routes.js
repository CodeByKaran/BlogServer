import {Router} from "express"
import {authUser} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"

import {
   followOnUser,
   unfollowUser
} from "../controllers/Follower.controller.js"


const router = Router()


router.route("/to/:toUserId").post(authUser,followOnUser)

router.route("/unfollow/:userId").post(authUser,unfollowUser)


export default router