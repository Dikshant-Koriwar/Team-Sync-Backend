import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { Session } from "express-session";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user,
          });
        });
      }
    )(req, res, next);
  }
);

// export const logOutController = asyncHandler(
//   async (req: Request, res: Response) => {
//     req.logout((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//         return res
//           .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//           .json({ error: "Failed to log out" });
//       }
      
//     });

//     //req.session = null;
    
  
//     // return res
//     //   .status(HTTPSTATUS.OK)
//     //   .json({ message: "Logged out successfully" });
//   }
// );
export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to log out" });
      }
      
      // Only destroy session after logout completes successfully
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);
          return res
            .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
            .json({ error: "Failed to destroy session" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid'); // or whatever your session cookie name is
        
        return res
          .status(HTTPSTATUS.OK)
          .json({ message: "Logged out successfully" });
      });
    });
  }
);
// import { NextFunction, Request, Response } from "express";
// import { asyncHandler } from "../middlewares/asyncHandler.middleware";
// import { config } from "../config/app.config";
// import { registerSchema } from "../validation/auth.validation";
// import { HTTPSTATUS } from "../config/http.config";
// import { registerUserService } from "../services/auth.service";
// import passport from "passport";

// // Extend express-session to include passport property
// import session from "express-session";

// declare module "express-session" {
//   interface SessionData {
//     passport?: { user: any };
//   }
// }

// export const googleLoginCallback = asyncHandler(
//   async (req: Request, res: Response) => {
//     const currentWorkspace = req.user?.currentWorkspace;

//     if (!currentWorkspace) {
//       return res.redirect(
//         `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
//       );
//     }

//     return res.redirect(
//       `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
//     );
//   }
// );

// export const registerUserController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const body = registerSchema.parse({
//       ...req.body,
//     });

//     await registerUserService(body);

//     return res.status(HTTPSTATUS.CREATED).json({
//       message: "User created successfully",
//     });
//   }
// );

// export const loginController = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     //changes made to use express-session
//     if (!req.session) {
//       return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//         message: "Session not available",
//       });
//     }

//     passport.authenticate(
//       "local",
//       (
//         err: Error | null,
//         user: Express.User | false,
//         info: { message: string } | undefined
//       ) => {
//         if (err) {
//           return next(err);
//         }

//         if (!user) {
//           return res.status(HTTPSTATUS.UNAUTHORIZED).json({
//             message: info?.message || "Invalid email or password",
//           });
//         }

//         //changes made to use express-session
//         // Add additional session check before logIn
//         if (!req.session || typeof req.session.regenerate !== "function") {
//           console.error("Session regenerate method not available");
//           return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//             message: "Session error - please try again",
//           });
//         }

//         req.logIn(user, (err) => {
//           if (err) {
//             return next(err);
//           }

//           return res.status(HTTPSTATUS.OK).json({
//             message: "Logged in successfully",
//             user,
//           });
//         });
//       }
//     )(req, res, next);
//   }
// );


// export const logOutController = asyncHandler(
//   async (req: Request, res: Response) => {
//     req.logout((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//         return res
//           .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//           .json({ error: "Failed to log out" });
//       }
//     });

//     //     req.session = null;
//     // return res
//     //   .status(HTTPSTATUS.OK)
//     //   .json({ message: "Logged out successfully" });

//     // //changes made to use express-session
//     if (req.session) {
//       req.session.destroy((err) => {
//         if (err) {
//           console.error("Session destroy error:", err);
//         }
//       });
//     }
//     return res
//       .status(HTTPSTATUS.OK)
//       .json({ message: "Logged out successfully" });


//   }
// );