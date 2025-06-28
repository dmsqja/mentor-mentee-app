require('crypto');

// JWT configuration
const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: '1h',
    issuer: 'mentor-mentee-app',
    audience: 'mentor-mentee-users'
};

// Generate a random JTI (JWT ID)
function generateJti() {
    return require('crypto').randomBytes(16).toString('hex');
}

module.exports = {
    JWT_CONFIG,
    generateJti
};
