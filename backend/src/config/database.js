const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, '../../database/mentor_mentee.db');

let db;

// Initialize database connection
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Ensure database directory exists
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('📦 Connected to SQLite database');
                createTables()
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    });
}

// Create tables if they don't exist
function createTables() {
    return new Promise((resolve, reject) => {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('mentor', 'mentee')),
                name TEXT,
                bio TEXT,
                tech_stack TEXT, -- JSON string for mentor's tech stack
                profile_image BLOB,
                profile_image_type TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createMatchRequestsTable = `
            CREATE TABLE IF NOT EXISTS match_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mentee_id INTEGER NOT NULL,
                mentor_id INTEGER NOT NULL,
                message TEXT,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (mentee_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE(mentee_id, mentor_id)
            )
        `;

        db.serialize(() => {
            db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Users table ready');
                }
            });

            db.run(createMatchRequestsTable, (err) => {
                if (err) {
                    console.error('Error creating match_requests table:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Match requests table ready');
                    resolve();
                }
            });
        });
    });
}

// Get database instance
function getDatabase() {
    return db;
}

// Close database connection
function closeDatabase() {
    return new Promise((resolve) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('📦 Database connection closed');
                }
                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initializeDatabase,
    getDatabase,
    closeDatabase
};
