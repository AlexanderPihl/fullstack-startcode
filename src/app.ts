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
import cors from "cors"
app.use(cors());


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


//graphQl
import authMiddleware from "./middleware/basic-auth"
app.use(express.json());
//app.use("/graphql", authMiddleware)

app.use("/graphql", (req, res, next) => {
    const body = req.body;
    if (body && body.query && body.query.includes("createFriend")) {
        console.log("Create")
        return next();
    }
    if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
        return next();
    }
    if (body.query && (body.mutation || body.query)) {
        return authMiddleware(req, res, next)
    }
    next();
})

import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

// Default 404 handlers for api-requests
app.use("/api", (req, res, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" })
})

// Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof (ApiError)) {
        res.status(err.errorCode).json({ errorCode: err.errorCode, msg: err.message })
    } else {
        next(err)
    }
})


export default app;

