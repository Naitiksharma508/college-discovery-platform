const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for connecting to Neon
  }
});

// Test the database connection
pool.connect()
  .then(() => console.log('Successfully connected to Neon PostgreSQL!'))
  .catch(err => console.error('Database connection error', err.stack));

// A simple test route
app.get('/', (req, res) => {
  res.send('College Discovery API is running!');
});
// Get a list of colleges (with infinite scroll pagination)
app.get('/api/colleges', async (req, res) => {
  try {
    // 1. Figure out which "page" of data the user is on (default is 1)
    const page = parseInt(req.query.page) || 1;
    
    // 2. We will send 10 colleges at a time to keep the website fast
    const limit = 10; 
    
    // 3. Calculate how many items to skip based on the page number
    const offset = (page - 1) * limit; 

    // 4. Ask the database for the colleges
    const result = await pool.query(
      'SELECT id, name, location, fees, rating FROM colleges ORDER BY rating DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    // 5. Send the data back to the frontend
    res.json(result.rows);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
// Start the server
// Get details for a SINGLE college by ID (Includes courses, placements, and Q&A)
app.get('/api/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the main college info
    const collegeResult = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
    
    if (collegeResult.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const college = collegeResult.rows[0];

    // 2. Fetch the related data from the other tables
    const coursesResult = await pool.query('SELECT * FROM courses WHERE college_id = $1', [id]);
    const placementsResult = await pool.query('SELECT * FROM placements WHERE college_id = $1', [id]);
    const qnaResult = await pool.query('SELECT * FROM qna WHERE college_id = $1', [id]);

    // 3. Package it all together and send it back
    res.json({
      ...college,
      courses: coursesResult.rows,
      placements: placementsResult.rows,
      qna: qnaResult.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
// Get multiple colleges for the Comparison Table
app.get('/api/compare', async (req, res) => {
  try {
    const idsString = req.query.ids; // e.g., "1,2"
    
    if (!idsString) {
      return res.status(400).json({ error: "No college IDs provided" });
    }

    // Convert the string "1,2" into an array of numbers [1, 2]
    const idArray = idsString.split(',').map(Number);

    // Fetch the colleges AND their placement stats in one go
    const query = `
      SELECT 
        c.id, c.name, c.location, c.fees, c.rating, 
        p.placement_percentage, p.average_package
      FROM colleges c
      LEFT JOIN placements p ON c.id = p.college_id
      WHERE c.id = ANY($1)
    `;
    
    const result = await pool.query(query, [idArray]);
    res.json(result.rows);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});