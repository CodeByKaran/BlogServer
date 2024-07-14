import express from "express"
import {User} from "./models/User.model.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from 'passport'
import {Strategy as GoogleStrategy}  from 'passport-google-oauth20';
import session from 'express-session'



const app = express()

app.use(cors({
   origin:process.env.ORIGIN,
   credentials: true
}))

app.use(express.json({
   limit:"16kb"
}))
app.use(cookieParser())
app.use(express.urlencoded({
   extended:true,
   limi:"16kb"
}))
app.use(express.static("public"))


// Routes 
import UserRouter from "./routes/User.routes.js"
import BlogRouter from "./routes/Blog.routes.js"
import LikeRouter from "./routes/Like.routes.js"
import CommentRouter from "./routes/Comment.routes.js"
import FollowerRouter from "./routes/Follower.routes.js"
import SaveRouter from "./routes/Save.routes.js"
import CommentLikeRouter from "./routes/CommentLike.routes.js"
import SearchRouter from "./routes/Search.routes.js"


app.use("/api/v1/user",UserRouter)
app.use("/api/v1/blog",BlogRouter)
app.use("/api/v1/like",LikeRouter)
app.use("/api/v1/comment",CommentRouter)
app.use("/api/v1/follow/user",FollowerRouter)
app.use("/api/v1/save",SaveRouter)
app.use("/api/v1/comment",CommentLikeRouter)
app.use("/api/v1/search",SearchRouter)

export default app