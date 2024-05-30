import dotenv from "dotenv"
import app from "./App.js"
import {connect} from "./db/index.js"

dotenv.config({
   path:"./.env"
})


connect()
.then(res=>{
   const network = app.listen(process.env.PORT,()=>{
   console.log("Server Is Listening on port",process.env.PORT);
})
})
