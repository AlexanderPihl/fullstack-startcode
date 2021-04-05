import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import path from "path"

//import friendRoutes from "./routes/XXXFriendRoutes";
import friendRoutes from "./routes/friendRoutesAuth";
import {ApiError} from "./errors/apiError"
import {Request, Response,  NextFunction} from "express"

//WINSTON/MORGAN-LOGGER
import logger, { stream } from "./middleware/logger";
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", logger) 
//The line above sets the logger as a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production

//MyCors
/* import myCors from "./middleware/myCors"
app.use(myCors); */
//Using Cors package.json
/* const cors = require('cors')
app.use(cors());
 */

//SIMPLE LOGGER
/* import simpleLogger from "./middleware/simpleLogger"
app.use(simpleLogger); */


//Allows to access public folder from outside, using express static middleware.
app.use(express.static(path.join(process.cwd(), "public")))


//uses friends facade
app.use("/api/friends", friendRoutes);


app.get("/demo", (req, res) => {
  res.send("Server is really up");
})


//Rammer denne middleware når man prøver at tilgå ugyldigt endpoint eller ikke får noget respons tilbage.
//404 handler for api-request
//Our own default 404-handler for api-requests
app.use("/api", (req: any, res: any, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" })
})


//Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof (ApiError)) {
    //res.status(err.errorCode).json({ errorCode: 404, msg: err.message })
    res.status(err.errorCode).json({ errorCode: err.errorCode, msg: err.message })
  } else {
    next(err)
  }
})

//middleware test: DELETE THIS????
/* import authMiddleware from "./middleware/basic-auth"
app.use("/", authMiddleware)

app.get("/whoami", (req: any, res) => {
  const user = req.credentials;
  res.json(user)
}) */

export default app;

