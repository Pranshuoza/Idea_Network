import express from "express";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import connectDB from "../src/config/dbConfig.js";
import ServerConfig from "../src/config/serverConfig.js";

import authRouter from "./routes/authRoute.js";
import collaborationRouter from "./routes/collaborationRoute.js";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/collaboration", collaborationRouter);

app.listen(ServerConfig.PORT, async () => {
  await connectDB();
  console.log(`Server started at PORT ${ServerConfig.PORT}`);
});
