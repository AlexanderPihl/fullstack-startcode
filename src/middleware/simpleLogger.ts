import express from "express";
const app = express();
const debug = require("debug")("app")
import {Request, Response, NextFunction} from "express"


const simpleLogger = function (req: Request, res: Response, next: NextFunction) {
  debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip)
  next()
}

export default simpleLogger;