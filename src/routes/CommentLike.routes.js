import {Router} from "express"
import {authUser} from "../middleware/Auth.middleware.js"
import {
   unlikeComments,
   likeComments
} from "../controllers/CommentLike.controller.js"


const router = Router()



router.route("/like/:cId").post(authUser,likeComments)


router.route("/like/retrive/:cId").post(authUser,unlikeComments)




export default router