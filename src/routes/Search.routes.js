import {Router} from "express"
import {authUser,simpleAuth} from "../middleware/Auth.middleware.js"
import {
   searchByUsername,
   searchByMostFollowed,
   searchByOwner,
   searchBySliceUsername
} from "../controllers/Search.controller.js"

const router = Router()


router.route("/user/usrnm").get(simpleAuth,searchByUsername)

router.route("/user/mstflwd").get(simpleAuth,searchByMostFollowed)

router.route("/user/owner").get(simpleAuth,searchByOwner)

router.route("/user/usrnm/slice").get(simpleAuth,searchBySliceUsername)




export default router