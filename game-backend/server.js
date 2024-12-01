const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'bananagame',
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Register user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err) => {
                if (err) return res.status(400).json({ message: 'Error registering user.' });
                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Return username and user ID for further use
        const user = {
            id: results[0].id,
            username: results[0].username,
        };

        res.status(200).json({ message: 'Login successful!', user });
    });
});


// Save Score to the Leaderboard
app.post('/saveScore', (req, res) => {
    const { user_id, score } = req.body;
    if (!user_id || !score) {
        return res.status(400).json({ error: 'Missing user_id or score' });
    }

    const query = 'INSERT INTO leaderboard (user_id, score) VALUES (?, ?)';
    db.query(query, [user_id, score], (err, result) => {
        if (err) {
            console.error('Error saving score:', err);
            return res.status(500).json({ error: 'Failed to save score' });
        }
        res.json({ message: 'Score saved successfully', result });
    });
});


// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
    const query = `
        SELECT u.username, l.score
        FROM leaderboard l
        INNER JOIN users u ON l.user_id = u.id
        ORDER BY l.score DESC;
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching leaderboard:', err);
            return res.status(500).json({ message: 'Error fetching leaderboard.' });
        }

        //fetched data
        res.status(200).json(results);
    });
});


// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
