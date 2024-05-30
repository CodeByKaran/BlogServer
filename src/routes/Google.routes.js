import {Router} from "express"
import passport from "passport"
import {googleProfile} from "../controllers/GoogleAuth.controller.js"

const router = Router()


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle the callback after Google has authenticated the user
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173/'); // Redirect to React app after logout
  });
});



export default router