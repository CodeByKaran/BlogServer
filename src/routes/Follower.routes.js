import {Router} from "express"
import {authUser,simpleAuth} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"

import {
   followOnUser,
   unfollowUser,
   getFollowerOfUser,
   getFollowingOfUser
} from "../controllers/Follower.controller.js"


const router = Router()


router.route("/to/:toUserId").post(authUser,followOnUser)

router.route("/unfollow/:userId").post(authUser,unfollowUser)


router.route("/getList").get(simpleAuth,getFollowerOfUser)


router.route("/getList/following").get(simpleAuth,getFollowingOfUser)


export default router