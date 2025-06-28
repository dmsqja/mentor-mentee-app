const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { JWT_CONFIG, generateJti } = require('../config/jwt');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         role:
 *           type: string
 *           enum: [mentor, mentee]
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         tech_stack:
 *           type: array
 *           items:
 *             type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['mentor', 'mentee']),
    body('name').optional().trim(),
    body('bio').optional().trim(),
    body('tech_stack').optional().isArray()
], async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, role, name, bio, tech_stack } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create user
        const userData = {
            email,
            password,
            role,
            name,
            bio,
            tech_stack: tech_stack ? JSON.stringify(tech_stack) : null
        };

        const user = await User.create(userData);

        // Generate JWT token
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign({
            // Standard claims
            iss: JWT_CONFIG.issuer,
            sub: user.id.toString(),
            aud: JWT_CONFIG.audience,
            exp: now + 3600, // 1 hour
            nbf: now,
            iat: now,
            jti: generateJti(),
            // Custom claims
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_CONFIG.secret);

        res.status(201).json({
            token,
            user: user.toJSON()
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign({
            // Standard claims
            iss: JWT_CONFIG.issuer,
            sub: user.id.toString(),
            aud: JWT_CONFIG.audience,
            exp: now + 3600, // 1 hour
            nbf: now,
            iat: now,
            jti: generateJti(),
            // Custom claims
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_CONFIG.secret);

        res.json({
            token,
            user: user.toJSON()
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
