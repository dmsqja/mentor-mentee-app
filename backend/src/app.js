const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Import OpenAPI document
const openApiDocument = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { initializeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    explorer: true,
    customSiteTitle: 'Mentor-Mentee API Documentation'
}));

// OpenAPI JSON endpoint
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openApiDocument);
});

// Root redirect to Swagger UI
app.get('/', (req, res) => {
    res.redirect('/swagger-ui');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/swagger-ui`);
    console.log(`📋 OpenAPI spec available at http://localhost:${PORT}/openapi.json`);
});

module.exports = app;
