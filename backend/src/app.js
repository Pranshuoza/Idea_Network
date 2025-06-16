import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/config/dbConfig.js";
import ServerConfig from "../src/config/serverConfig.js";
import passport from "./config/passportConfig.js";
import session from "express-session";
import { initSocket } from "./config/socket.js";

import authRouter from "./routes/authRoute.js";
import socialAuthRouter from "./routes/socialAuthRoute.js";
import ideaRouter from "./routes/ideaRoute.js";
import collaborationRouter from "./routes/collaborationRoute.js";
import startupRouter from "./routes/startupRoute.js";
import { protectRoute } from "./middleware/authProtect.js";
import notificationRouter from "./routes/notificationRoute.js";

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Session configuration
const sessionConfig = {
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
  },
  name: "sessionId", // Change default connect.sid
};

app.use(session(sessionConfig));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRouter);
app.use('/auth', socialAuthRouter);
app.use("/ideas", protectRoute, ideaRouter);
app.use("/collaboration", protectRoute, collaborationRouter);
app.use("/startup", protectRoute, startupRouter);
app.use("/notifications", protectRoute, notificationRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
httpServer.listen(ServerConfig.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server started at PORT ${ServerConfig.PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
});
