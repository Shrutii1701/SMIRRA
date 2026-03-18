// ─── server/index.js ──────────────────────────────────────────────────
// Entry point for the Express server.
//
// WHY this order matters:
//   1. dotenv FIRST — so all subsequent code can read process.env
//   2. Express app creation
//   3. Security middleware (helmet) — sets headers before any response
//   4. Logging middleware (morgan) — logs every incoming request
//   5. Body parsers — so req.body is available in routes
//   6. CORS — so the React frontend can talk to us
//   7. Rate limiter — prevents abuse before hitting business logic
//   8. Routes — the actual API endpoints
//   9. Error handler LAST — catches anything the routes didn't handle
// ──────────────────────────────────────────────────────────────────────

// 1. Load environment variables BEFORE anything else
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

// Connect to Database
connectDB();

const interviewRoutes = require('./routes/interviewRoutes');
const errorHandler = require('./middleware/errorHandler');

// ─── Create the Express app ─────────────────────────
const app = express();

// ─── Middleware Stack ────────────────────────────────

// Security headers — one-liner that adds XSS protection, CSP, etc.
app.use(helmet());

// Request logging — 'dev' format gives colorized, concise output
// Example: GET /api/interview/topics 200 12.345 ms
app.use(morgan('dev'));

// Parse JSON bodies — allows req.body to work with JSON payloads
// limit: '10mb' prevents accidental huge payloads from crashing the server
app.use(express.json({ limit: '10mb' }));

// CORS — allow the React dev server (port 5173) to call our API
// In production, you'd restrict this to your actual domain
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
}));

// Rate limiting — especially important for AI endpoints (they cost money!)
// 100 requests per 15 minutes per IP is generous for an interview app
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,
    message: {
        success: false,
        error: { message: 'Too many requests. Please try again later.' },
    },
});
app.use('/api/', limiter);

// ─── Routes ─────────────────────────────────────────

// Health check — useful for deployment monitoring
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount all interview-related routes under /api/interview
app.use('/api/interview', interviewRoutes);

// ─── Error Handling ─────────────────────────────────

// 404 handler — must come AFTER all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { message: `Route ${req.originalUrl} not found` },
    });
});

// Global error handler — must be the LAST middleware (4 params = error handler)
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════════╗
  ║   🎯 Interview Arena API Server               ║
  ║   Running on: http://localhost:${PORT}           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
