import {Router} from "express"
import {authUser} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"

import {
   commentOnBlog,
   deleteComment,
   editComment
} from "../controllers/Comment.controller.js"


const router = Router()


router.route("/to/:blogId").post(authUser,commentOnBlog)

router.route("/delete/:commentId").delete(authUser,deleteComment)

router.route("/edit/:commentId").put(authUser,editComment)

export default router