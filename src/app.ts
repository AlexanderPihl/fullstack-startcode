import express from "express";
import dotenv from "dotenv";
import path from "path"
dotenv.config()
const app = express()

import friendRoutes from "./routes/FriendRoutes";

app.use(express.static(path.join(process.cwd(), "public")))

//uses friends facade
app.use("/api/friends", friendRoutes);

app.get("/demo", (req, res) => {
  res.send("Server is really up - auth working");
})

//middleware test:
/* import authMiddleware from "../middleware/basic-auth"
app.use("/", authMiddleware)

app.get("/whoami", (req: any, res) => {
  const user = req.credentials;
  res.json(user)
}) */


export default app;

