const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile image upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024, // 1MB
    },
    fileFilter: (req, file, cb) => {
        // Only allow jpg and png files
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg and .png files are allowed'), false);
        }
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
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
 *         profile_image_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ProfileUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *         tech_stack:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.toJSON());
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticateToken, [
    body('name').optional().trim().isLength({ min: 1 }),
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

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { name, bio, tech_stack } = req.body;
        const updateData = {
            name,
            bio,
            tech_stack: tech_stack ? JSON.stringify(tech_stack) : user.tech_stack
        };

        const updatedUser = await user.updateProfile(updateData);
        res.json(updatedUser.toJSON());

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/me/avatar:
 *   post:
 *     summary: Upload profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post('/me/avatar', authenticateToken, upload.single('avatar'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate image dimensions (basic check - in production you might want more sophisticated validation)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.updateProfileImage(req.file.buffer, req.file.mimetype);

        res.json({ message: 'Profile image updated successfully' });

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/{userId}/avatar:
 *   get:
 *     summary: Get user profile image
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: User or image not found
 */
router.get('/:userId/avatar', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profile_image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.set('Content-Type', user.profile_image_type);
        res.send(user.profile_image);

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/users/mentors:
 *   get:
 *     summary: Get list of mentors
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: techStack
 *         schema:
 *           type: string
 *         description: Filter by technology stack
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, tech_stack, created_at]
 *         description: Sort mentors by field
 *     responses:
 *       200:
 *         description: List of mentors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/mentors', authenticateToken, [
    query('techStack').optional().trim(),
    query('sortBy').optional().isIn(['name', 'tech_stack', 'created_at'])
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

        const { techStack, sortBy } = req.query;
        const filters = {
            techStack,
            sortBy
        };

        const mentors = await User.getMentors(filters);
        const mentorsJson = mentors.map(mentor => mentor.toJSON());

        res.json(mentorsJson);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
