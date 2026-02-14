const rateLimit = require('express-rate-limit');

const limits = {
    default: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: { error: 'Too many requests, please try again later.' }
    }),
    auth: rateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: { error: 'Too many login attempts, please try again later.' }
    }),
    audit: rateLimit({
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        max: 100,
        message: { error: 'Daily audit limit reached.' }
    }),
    submission: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour (approx quest window)
        max: 5, // generous buffer
        message: { error: 'Submission limit reached.' }
    })
};

module.exports = limits;
