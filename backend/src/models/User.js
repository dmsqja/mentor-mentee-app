const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        this.name = data.name;
        this.bio = data.bio;
        this.tech_stack = data.tech_stack;
        this.profile_image = data.profile_image;
        this.profile_image_type = data.profile_image_type;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Create a new user
    static async create(userData) {
        const db = getDatabase();
        const { email, password, role, name, bio, tech_stack } = userData;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (email, password, role, name, bio, tech_stack)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [email, hashedPassword, role, name, bio, tech_stack], function(err) {
                if (err) {
                    reject(err);
                } else {
                    User.findById(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Find user by ID
    static async findById(id) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(new User(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Find user by email
    static async findByEmail(email) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(new User(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Get all mentors with optional filtering
    static async getMentors(filters = {}) {
        const db = getDatabase();
        let sql = 'SELECT * FROM users WHERE role = "mentor"';
        const params = [];

        // Add tech stack filter if provided
        if (filters.techStack) {
            sql += ' AND tech_stack LIKE ?';
            params.push(`%${filters.techStack}%`);
        }

        // Add sorting
        if (filters.sortBy === 'name') {
            sql += ' ORDER BY name';
        } else if (filters.sortBy === 'tech_stack') {
            sql += ' ORDER BY tech_stack';
        } else {
            sql += ' ORDER BY created_at DESC';
        }

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const users = rows.map(row => new User(row));
                    resolve(users);
                }
            });
        });
    }

    // Update user profile
    async updateProfile(updateData) {
        const db = getDatabase();
        const { name, bio, tech_stack } = updateData;

        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE users 
                SET name = ?, bio = ?, tech_stack = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [name, bio, tech_stack, this.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    User.findById(this.id)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Update profile image
    async updateProfileImage(imageBuffer, imageType) {
        const db = getDatabase();

        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE users 
                SET profile_image = ?, profile_image_type = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [imageBuffer, imageType, this.id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Verify password
    async verifyPassword(plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    }

    // Convert to JSON (exclude password and image data)
    toJSON() {
        const userData = { ...this };
        delete userData.password;
        
        // Convert tech_stack from JSON string to array
        if (userData.tech_stack) {
            try {
                userData.tech_stack = JSON.parse(userData.tech_stack);
            } catch (e) {
                userData.tech_stack = [];
            }
        }

        // Add profile image URL if exists
        if (userData.profile_image) {
            userData.profile_image_url = `/api/users/${userData.id}/avatar`;
            delete userData.profile_image; // Don't send raw image data
        } else {
            // Use default placeholder image
            const placeholder = userData.role === 'mentor' 
                ? 'https://placehold.co/500x500.jpg?text=MENTOR'
                : 'https://placehold.co/500x500.jpg?text=MENTEE';
            userData.profile_image_url = placeholder;
        }

        return userData;
    }
}

module.exports = User;
