import {Router} from "express"


import {
   uploadBlog,
   deletBlog,
   getSingleBlog,
   getBlog,
   getBlogOfUser,
   getBlogContentOfUser
} from "../controllers/Blog.controller.js"

import {authUser,simpleAuth} from "../middleware/Auth.middleware.js"

import {upload} from "../middleware/Multer.middleware.js"
import {paginationMiddleware} from "../middleware/Pagginate.middleware.js"

const router = Router()


router.route("/create").post(
   authUser,
   upload.single('con_image'),
   uploadBlog
)

router.route("/delete/:id").post(authUser,deletBlog)

router.route("/fetch/one/:id").get(simpleAuth,getSingleBlog)

router.route("/fetch/all").get(simpleAuth,paginationMiddleware,getBlog)


router.route("/fetch/by/user").get(simpleAuth,getBlogOfUser)


router.route("/fetch/content").get(simpleAuth,getBlogContentOfUser)




export default router