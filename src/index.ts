import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";
import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import session from "express-session";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import userRoutes from "./routes/user.route";
import workspaceRoutes from "./routes/workspace.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.set("trust proxy", 1); // ✅ ADD THIS LINE HERE

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: config.SESSION_SECRET || "your-very-long-secret-key-here",
    resave: false,
    saveUninitialized: false,
    rolling: false,
    name: "connect.sid",
    cookie: {
      // secure: false,
      // maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // sameSite: "lax",
      secure: config.NODE_ENV === "production", // ✅ Only true in deployed env
      httpOnly: true, // ✅ Prevent JS access
      sameSite: "none", // ✅ Allow cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // ✅ 1 day
    },
  })
);

app.use((req, res, next) => {
  if (req.session && typeof req.session.regenerate !== "function") {
    req.session.regenerate = (cb) => {
      if (cb) cb(null);
      return req.session;
    };
  }
  if (req.session && typeof req.session.save !== "function") {
    req.session.save = (cb) => {
      if (cb) cb(null);
      return req.session;
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Team Sync Backend API is running!",
      status: "healthy",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
