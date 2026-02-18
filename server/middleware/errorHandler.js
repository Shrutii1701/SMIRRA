// ─── middleware/errorHandler.js ────────────────────────────────────────
// WHY: Without a centralized error handler, every controller needs its
// own try/catch with inconsistent error formats. This middleware
// catches ALL errors (thrown or passed via next(err)) and returns
// a consistent JSON response. Express recognizes a middleware with
// 4 parameters (err, req, res, next) as an error handler.
// ──────────────────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
    // Log the full error in development for debugging
    console.error(`❌ [${new Date().toISOString()}] ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Determine the status code:
    // - If the error already has a statusCode (set by our controllers), use it
    // - Otherwise default to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            // Only include the stack trace in development — never leak it in production
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;
