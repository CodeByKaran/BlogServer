import {Router} from "express"


import {
   uploadBlog,
   deletBlog,
   getSingleBlog,
   getBlog
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

router.route("/fetch/one/:id").get(authUser,getSingleBlog)

router.route("/fetch/all").get(simpleAuth,paginationMiddleware,getBlog)


export default router