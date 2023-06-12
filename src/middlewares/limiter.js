const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60*1000,
  max: 50,
  message: 'Server is at its maximum capacity. Please wait for a minute before continuing..'
})

const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min in milliseconds
  max: 30,
  message: 'Login error, you have reached maximum retries. Please try again after 10 minutes',
  requestWasSuccessful: (req, res) => response.statusCode < 400,
  statusCode: 429,
  headers: true,
});

const feedbackRequestsLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 5,
  message: 'You have submitted maximum amount of feedbacks. Please try again after 24 hours', 
  statusCode: 429,
//   headers: true,
});

const bugRequestLimiter = rateLimit({
  windowMs: 2 * 10 * 60 * 1000,
  max: 20,
  message: 'You have submitted maximum amount of bugs. Please try again later.',
  statusCode: 429
})

module.exports = { loginRateLimiter, feedbackRequestsLimiter, apiLimiter, bugRequestLimiter }