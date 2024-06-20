import {Router} from "express"
import {authUser} from "../middleware/Auth.middleware.js"

import {
   saveBlog,
   removeSavedBlog,
   getSavedBlog
} from "../controllers/Save.controller.js"

const router = Router()



router.route("/blog/:blogId").post(authUser,saveBlog)

router.route("/blog/remove/:blogId").put(authUser,removeSavedBlog)

router.route("/blog/get").get(authUser,getSavedBlog)


export default router