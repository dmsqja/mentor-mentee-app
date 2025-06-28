const express = require('express');
const { body, validationResult } = require('express-validator');
const MatchRequest = require('../models/MatchRequest');
const User = require('../models/User');
const { authenticateToken, requireMentee, requireMentor } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         mentee_id:
 *           type: integer
 *         mentor_id:
 *           type: integer
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         mentor_name:
 *           type: string
 *         mentee_name:
 *           type: string
 *     CreateMatchRequest:
 *       type: object
 *       required:
 *         - mentor_id
 *       properties:
 *         mentor_id:
 *           type: integer
 *         message:
 *           type: string
 *     UpdateMatchStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [accepted, rejected]
 */

/**
 * @swagger
 * /api/matches/requests:
 *   post:
 *     summary: Create a match request (mentee only)
 *     tags: [Match Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatchRequest'
 *     responses:
 *       201:
 *         description: Match request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchRequest'
 *       400:
 *         description: Validation error or business logic error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only mentees can create requests
 */
router.post('/requests', authenticateToken, requireMentee, [
    body('mentor_id').isInt({ min: 1 }),
    body('message').optional().trim()
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

        const { mentor_id, message } = req.body;
        const mentee_id = req.user.id;

        // Check if mentor exists
        const mentor = await User.findById(mentor_id);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(400).json({ error: 'Invalid mentor ID' });
        }

        // Check if mentee has any pending requests
        const hasPending = await MatchRequest.hasPendingRequest(mentee_id);
        if (hasPending) {
            return res.status(400).json({ 
                error: 'You already have a pending request. Please wait for response or cancel it first.' 
            });
        }

        // Check if mentor already has accepted request
        const mentorHasAccepted = await MatchRequest.hasAcceptedRequest(mentor_id);
        if (mentorHasAccepted) {
            return res.status(400).json({ 
                error: 'This mentor is already matched with another mentee.' 
            });
        }

        // Create match request
        const requestData = {
            mentee_id,
            mentor_id,
            message
        };

        const matchRequest = await MatchRequest.create(requestData);
        res.status(201).json(matchRequest.toJSON());

    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ 
                error: 'You have already sent a request to this mentor.' 
            });
        }
        next(error);
    }
});

/**
 * @swagger
 * /api/matches/my-requests:
 *   get:
 *     summary: Get current user's match requests
 *     tags: [Match Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of match requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchRequest'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-requests', authenticateToken, async (req, res, next) => {
    try {
        let requests;

        if (req.user.role === 'mentee') {
            // Get requests sent by this mentee
            requests = await MatchRequest.getByMenteeId(req.user.id);
        } else if (req.user.role === 'mentor') {
            // Get requests received by this mentor
            requests = await MatchRequest.getByMentorId(req.user.id);
        } else {
            return res.status(400).json({ error: 'Invalid user role' });
        }

        const requestsJson = requests.map(request => request.toJSON());
        res.json(requestsJson);

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/matches/requests/{requestId}/status:
 *   put:
 *     summary: Update match request status (mentor only)
 *     tags: [Match Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMatchStatus'
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchRequest'
 *       400:
 *         description: Validation error or business logic error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only mentors can update request status
 *       404:
 *         description: Request not found
 */
router.put('/requests/:requestId/status', authenticateToken, requireMentor, [
    body('status').isIn(['accepted', 'rejected'])
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

        const { requestId } = req.params;
        const { status } = req.body;

        // Find the match request
        const matchRequest = await MatchRequest.findById(requestId);
        if (!matchRequest) {
            return res.status(404).json({ error: 'Match request not found' });
        }

        // Check if this mentor owns the request
        if (matchRequest.mentor_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only update your own requests' });
        }

        // Check if request is still pending
        if (matchRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request has already been processed' });
        }

        // If accepting, check if mentor already has accepted request
        if (status === 'accepted') {
            const mentorHasAccepted = await MatchRequest.hasAcceptedRequest(req.user.id);
            if (mentorHasAccepted) {
                return res.status(400).json({ 
                    error: 'You already have an accepted match request.' 
                });
            }
        }

        // Update status
        const updatedRequest = await matchRequest.updateStatus(status);
        res.json(updatedRequest.toJSON());

    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/matches/requests/{requestId}:
 *   delete:
 *     summary: Delete/cancel match request (mentee only)
 *     tags: [Match Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only mentees can delete their own requests
 *       404:
 *         description: Request not found
 */
router.delete('/requests/:requestId', authenticateToken, requireMentee, async (req, res, next) => {
    try {
        const { requestId } = req.params;

        // Find the match request
        const matchRequest = await MatchRequest.findById(requestId);
        if (!matchRequest) {
            return res.status(404).json({ error: 'Match request not found' });
        }

        // Check if this mentee owns the request
        if (matchRequest.mentee_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own requests' });
        }

        // Delete the request
        await matchRequest.delete();
        res.json({ message: 'Match request deleted successfully' });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
