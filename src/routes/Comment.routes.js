import {Router} from "express"
import {authUser,simpleAuth} from "../middleware/Auth.middleware.js"
import {upload} from "../middleware/Multer.middleware.js"

import {
   commentOnBlog,
   deleteComment,
   editComment,
   getComments
} from "../controllers/Comment.controller.js"


const router = Router()


router.route("/to/:blogId").post(authUser,commentOnBlog)

router.route("/delete/:commentId").delete(authUser,deleteComment)

router.route("/edit/:commentId").put(authUser,editComment)

router.route("/get/:blogId").get(simpleAuth,getComments)

export default router