const { getDatabase } = require('../config/database');

class MatchRequest {
    constructor(data) {
        this.id = data.id;
        this.mentee_id = data.mentee_id;
        this.mentor_id = data.mentor_id;
        this.message = data.message;
        this.status = data.status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Create a new match request
    static async create(requestData) {
        const db = getDatabase();
        const { mentee_id, mentor_id, message } = requestData;

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO match_requests (mentee_id, mentor_id, message)
                VALUES (?, ?, ?)
            `;
            
            db.run(sql, [mentee_id, mentor_id, message], function(err) {
                if (err) {
                    reject(err);
                } else {
                    MatchRequest.findById(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Find match request by ID
    static async findById(id) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT mr.*, 
                       mentee.name as mentee_name, mentee.email as mentee_email,
                       mentor.name as mentor_name, mentor.email as mentor_email
                FROM match_requests mr
                JOIN users mentee ON mr.mentee_id = mentee.id
                JOIN users mentor ON mr.mentor_id = mentor.id
                WHERE mr.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(new MatchRequest(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Get match requests for a mentee
    static async getByMenteeId(menteeId) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT mr.*, 
                       mentor.name as mentor_name, 
                       mentor.email as mentor_email,
                       mentor.tech_stack as mentor_tech_stack
                FROM match_requests mr
                JOIN users mentor ON mr.mentor_id = mentor.id
                WHERE mr.mentee_id = ?
                ORDER BY mr.created_at DESC
            `;
            
            db.all(sql, [menteeId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const requests = rows.map(row => {
                        const request = new MatchRequest(row);
                        request.mentor_name = row.mentor_name;
                        request.mentor_email = row.mentor_email;
                        request.mentor_tech_stack = row.mentor_tech_stack;
                        return request;
                    });
                    resolve(requests);
                }
            });
        });
    }

    // Get match requests for a mentor
    static async getByMentorId(mentorId) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT mr.*, 
                       mentee.name as mentee_name, 
                       mentee.email as mentee_email
                FROM match_requests mr
                JOIN users mentee ON mr.mentee_id = mentee.id
                WHERE mr.mentor_id = ?
                ORDER BY mr.created_at DESC
            `;
            
            db.all(sql, [mentorId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const requests = rows.map(row => {
                        const request = new MatchRequest(row);
                        request.mentee_name = row.mentee_name;
                        request.mentee_email = row.mentee_email;
                        return request;
                    });
                    resolve(requests);
                }
            });
        });
    }

    // Check if mentee has pending request
    static async hasPendingRequest(menteeId) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT COUNT(*) as count 
                FROM match_requests 
                WHERE mentee_id = ? AND status = 'pending'
            `;
            
            db.get(sql, [menteeId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    // Check if mentor has accepted request
    static async hasAcceptedRequest(mentorId) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT COUNT(*) as count 
                FROM match_requests 
                WHERE mentor_id = ? AND status = 'accepted'
            `;
            
            db.get(sql, [mentorId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    // Update request status
    async updateStatus(status) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE match_requests 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [status, this.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    MatchRequest.findById(this.id)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Delete request
    async delete() {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM match_requests WHERE id = ?';
            
            db.run(sql, [this.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Convert to JSON
    toJSON() {
        const requestData = { ...this };
        
        // Parse tech_stack if it exists
        if (requestData.mentor_tech_stack) {
            try {
                requestData.mentor_tech_stack = JSON.parse(requestData.mentor_tech_stack);
            } catch (e) {
                requestData.mentor_tech_stack = [];
            }
        }

        return requestData;
    }
}

module.exports = MatchRequest;
