const { ipcRenderer } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('@electron/remote');

let db;

try {
    // Initialize database
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'chats.db');
    db = new sqlite3.Database(dbPath);

    // Create tables
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
            )
        `);
    });

    // Expose database operations to renderer process
    process.once('loaded', () => {
        global.database = {
            createChatSession: (title) => {
                return new Promise((resolve, reject) => {
                    const stmt = db.prepare('INSERT INTO chat_sessions (title) VALUES (?)');
                    stmt.run(title, function(err) {
                        if (err) reject(err);
                        else {
                            resolve({
                                id: this.lastID,
                                title,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                        }
                    });
                });
            },

            getChatSessions: () => {
                return new Promise((resolve, reject) => {
                    db.all('SELECT * FROM chat_sessions ORDER BY updated_at DESC', (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            },

            getChatMessages: (sessionId) => {
                return new Promise((resolve, reject) => {
                    db.all(
                        'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
                        [sessionId],
                        (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows);
                        }
                    );
                });
            },

            addChatMessage: (sessionId, role, content) => {
                return new Promise((resolve, reject) => {
                    db.serialize(() => {
                        const stmt = db.prepare(
                            'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)'
                        );
                        stmt.run(sessionId, role, content, function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            db.run(
                                'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                                [sessionId],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    resolve({
                                        id: this.lastID,
                                        session_id: sessionId,
                                        role,
                                        content,
                                        created_at: new Date().toISOString()
                                    });
                                }
                            );
                        });
                    });
                });
            },

            deleteChatSession: (sessionId) => {
                return new Promise((resolve, reject) => {
                    db.run('DELETE FROM chat_sessions WHERE id = ?', [sessionId], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            },

            updateChatSessionTitle: (sessionId, title) => {
                return new Promise((resolve, reject) => {
                    db.run(
                        'UPDATE chat_sessions SET title = ? WHERE id = ?',
                        [title, sessionId],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            },

            getFirstMessageContent: (sessionId) => {
                return new Promise((resolve, reject) => {
                    db.get(
                        'SELECT content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 1',
                        [sessionId],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row?.content || 'New Chat');
                        }
                    );
                });
            }
        };
    });
} catch (error) {
    console.error('Error initializing database:', error);
}

// Clean up database connection when app closes
process.on('exit', () => {
    if (db) {
        db.close();
    }
});
