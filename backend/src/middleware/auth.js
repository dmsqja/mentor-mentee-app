const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/jwt');

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_CONFIG.secret, {
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
    }, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }

        // Add user info to request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };

        next();
    });
}

// Middleware to check if user has specific role
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ error: `${role} role required` });
        }

        next();
    };
}

// Middleware to check if user is mentor
function requireMentor(req, res, next) {
    return requireRole('mentor')(req, res, next);
}

// Middleware to check if user is mentee
function requireMentee(req, res, next) {
    return requireRole('mentee')(req, res, next);
}

module.exports = {
    authenticateToken,
    requireRole,
    requireMentor,
    requireMentee
};
