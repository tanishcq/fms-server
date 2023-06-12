const express = require("express");
const { 
    signin, 
    signup, 
    reportBugs, 
    resetPassword, 
    createFeedback 
} = require("../controllers");
const userRouter = express.Router();
const { 
    auth, 
    loginRateLimiter, 
    feedbackRequestsLimiter 
} = require("../middlewares");

userRouter.post("/signup", signup);
userRouter.post("/signin", loginRateLimiter, signin);
userRouter.post("/reportBugs", auth, reportBugs);
userRouter.patch("/resetPassword", auth, resetPassword);
userRouter.post("/feedback", feedbackRequestsLimiter, createFeedback);

module.exports = userRouter;