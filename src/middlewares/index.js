const auth = require('./auth');
const { loginRateLimiter, feedbackRequestsLimiter, apiLimiter, bugRequestLimiter } = require('./limiter');

module.exports = {
    auth,
    loginRateLimiter,
    feedbackRequestsLimiter,
    bugRequestLimiter,
    apiLimiter
}