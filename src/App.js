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

app.use(session({
  secret: 'karan',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
     console.log(accessToken,refreshToken);
     console.log(profile);
   let user = await User.findOne({ googleId: profile.id});
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        fullname: profile.displayName,
        username: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        isverify: profile.emails[0].verify
      });
    }
    done(null, profile);
  }
));

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User not authenticated');
  }
  res.redirect(`http://localhost:5173?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

// Routes 
import UserRouter from "./routes/User.routes.js"
import BlogRouter from "./routes/Blog.routes.js"
import LikeRouter from "./routes/Like.routes.js"
import CommentRouter from "./routes/Comment.routes.js"
import FollowerRouter from "./routes/Follower.routes.js"
import GoogleRouter from "./routes/Google.routes.js"
import SaveRouter from "./routes/Save.routes.js"


app.use("/api/v1/user",UserRouter)
app.use("/api/v1/blog",BlogRouter)
app.use("/api/v1/like",LikeRouter)
app.use("/api/v1/comment",CommentRouter)
app.use("/api/v1/follow/user",FollowerRouter)
app.use("/auth",GoogleRouter)
app.use("/api/v1/save",SaveRouter)


export default app