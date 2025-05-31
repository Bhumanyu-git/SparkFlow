const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
const db = new sqlite3.Database('sparks.db', (err) => {
    if (err) {
        console.error('Could not connect to SQLite:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS sparks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});
app.post('/api/sparks', (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required.' });
    }
    db.run('INSERT INTO sparks (name, message) VALUES (?, ?)', [name, message], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to save spark.' });
        }
        res.json({ id: this.lastID, name, message });
    });
});
app.get('/api/sparks', (req, res) => {
    db.all('SELECT * FROM sparks ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch sparks.' });
        }
        res.json(rows);
    });
});
app.delete('/api/sparks/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM sparks WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete spark.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Spark not found.' });
        }
        res.json({ success: true });
    });
});
app.listen(port, () => {
    console.log(`SparkFlow backend running at http://localhost:${port}`);
});