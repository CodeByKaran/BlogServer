import {Router} from "express"
import {authUser} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"

import {
   likeOnBlog,
   removeLikeOnBlog
} from "../controllers/Like.controller.js"


const router = Router()


router.route("/to/:blogId").post(authUser,likeOnBlog)

router.route("/remove/to/:blogId").post(authUser,removeLikeOnBlog)






export default router