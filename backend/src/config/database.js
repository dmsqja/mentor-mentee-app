const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
                    // Create test accounts after tables are created
                    createTestAccounts()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    });
}

// Create test accounts for easy testing
async function createTestAccounts() {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if test accounts already exist
            db.get("SELECT id FROM users WHERE email = 'mentor@test.com' OR email = 'mentee@test.com'", async (err, row) => {
                if (err) {
                    console.error('Error checking existing test accounts:', err.message);
                    reject(err);
                    return;
                }

                if (row) {
                    console.log('📋 Test accounts already exist');
                    resolve();
                    return;
                }

                // Create test accounts
                const testAccounts = [
                    {
                        email: 'mentor@test.com',
                        password: await bcrypt.hash('test123', 10),
                        role: 'mentor',
                        name: '김멘토',
                        bio: '풀스택 개발자로 5년간 근무하고 있습니다. React, Node.js, Python을 주로 사용합니다.',
                        tech_stack: JSON.stringify(['React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL'])
                    },
                    {
                        email: 'mentor2@test.com',
                        password: await bcrypt.hash('test123', 10),
                        role: 'mentor',
                        name: '박멘토',
                        bio: 'AI/ML 엔지니어입니다. Python, TensorFlow, PyTorch 전문가입니다.',
                        tech_stack: JSON.stringify(['Python', 'TensorFlow', 'PyTorch', 'Jupyter', 'Docker'])
                    },
                    {
                        email: 'mentee@test.com',
                        password: await bcrypt.hash('test123', 10),
                        role: 'mentee',
                        name: '이멘티',
                        bio: '프로그래밍을 배우고 있는 학생입니다. 웹 개발에 관심이 많습니다.',
                        tech_stack: JSON.stringify(['HTML', 'CSS', 'JavaScript'])
                    },
                    {
                        email: 'mentee2@test.com',
                        password: await bcrypt.hash('test123', 10),
                        role: 'mentee',
                        name: '최멘티',
                        bio: 'AI 분야에 관심이 있는 초보 개발자입니다.',
                        tech_stack: JSON.stringify(['Python', 'Basic ML'])
                    }
                ];

                const insertPromises = testAccounts.map(account => {
                    return new Promise((resolveInsert, rejectInsert) => {
                        const stmt = db.prepare(`
                            INSERT INTO users (email, password, role, name, bio, tech_stack)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `);
                        
                        stmt.run([
                            account.email,
                            account.password,
                            account.role,
                            account.name,
                            account.bio,
                            account.tech_stack
                        ], function(err) {
                            if (err) {
                                console.error(`Error creating test account ${account.email}:`, err.message);
                                rejectInsert(err);
                            } else {
                                console.log(`✅ Created test ${account.role}: ${account.email}`);
                                resolveInsert();
                            }
                        });
                        
                        stmt.finalize();
                    });
                });

                await Promise.all(insertPromises);
                console.log('🎯 All test accounts created successfully');
                resolve();
            });
        } catch (error) {
            console.error('Error creating test accounts:', error);
            reject(error);
        }
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
