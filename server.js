const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB Connection
pool.connect()
  .then(() => console.log('Successfully connected to Neon PostgreSQL!'))
  .catch(err => console.error('Database connection error', err.stack));

// Home Route
app.get('/', (req, res) => {
  res.send('College Discovery API is running!');
});


// ===============================
// GET ALL COLLEGES
// ===============================
app.get('/api/colleges', async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = 10;

    const offset = (page - 1) * limit;

    // GET SEARCH + LOCATION
    const search = req.query.search || "";

    





    // SEARCH QUERY
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        location,
        fees,
        rating
      FROM colleges
      WHERE
        name ILIKE $1
        
      ORDER BY rating DESC
      LIMIT $3 OFFSET $4
      `,
      [
        `%${search}%`,
        
        limit,
        offset
      ]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      error: 'Server Error'
    });
  }
});


// ===============================
// GET SINGLE COLLEGE DETAILS
// ===============================
app.get('/api/colleges/:id', async (req, res) => {
  try {

    const { id } = req.params;

    // College Info
    const collegeResult = await pool.query(
      'SELECT * FROM colleges WHERE id = $1',
      [id]
    );

    if (collegeResult.rows.length === 0) {
      return res.status(404).json({
        error: 'College not found'
      });
    }

    const college = collegeResult.rows[0];

    // Courses
    const coursesResult = await pool.query(
      'SELECT * FROM courses WHERE college_id = $1',
      [id]
    );

    // Placements
    const placementsResult = await pool.query(
      'SELECT * FROM placements WHERE college_id = $1',
      [id]
    );

    // Questions
    const qnaResult = await pool.query(
      `
      SELECT *
      FROM qna
      WHERE college_id = $1
      ORDER BY created_at DESC
      `,
      [id]
    );

    // Add answers to every question
    const questionsWithAnswers = await Promise.all(
      qnaResult.rows.map(async (question) => {

        const answersResult = await pool.query(
          `
          SELECT *
          FROM answers
          WHERE question_id = $1
          ORDER BY created_at ASC
          `,
          [question.id]
        );

        return {
          ...question,
          answers: answersResult.rows
        };

      })
    );

    // Final Response
    res.json({
      ...college,
      courses: coursesResult.rows,
      placements: placementsResult.rows,
      qna: questionsWithAnswers
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      error: 'Server Error'
    });
  }
});


// ===============================
// COMPARE COLLEGES
// ===============================
app.get('/api/compare', async (req, res) => {
  try {

    const idsString = req.query.ids;

    if (!idsString) {
      return res.status(400).json({
        error: "No college IDs provided"
      });
    }

    const idArray = idsString
      .split(',')
      .map(Number);

    const query = `
      SELECT 
        c.id,
        c.name,
        c.location,
        c.fees,
        c.rating,
        p.placement_percentage,
        p.average_package
      FROM colleges c
      LEFT JOIN placements p
      ON c.id = p.college_id
      WHERE c.id = ANY($1)
    `;

    const result = await pool.query(query, [idArray]);

    res.json(result.rows);

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      error: 'Server Error'
    });
  }
});


// ===============================
// ADD QUESTION
// ===============================
app.post('/api/questions', async (req, res) => {
  try {

    const { college_id, question } = req.body;

    const result = await pool.query(
      `
      INSERT INTO qna (college_id, question)
      VALUES ($1, $2)
      RETURNING *
      `,
      [college_id, question]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err.message);

    res.status(500).send('Server Error');
  }
});


// ===============================
// ADD ANSWER
// ===============================
app.post('/api/answers', async (req, res) => {
  try {

    const { question_id, answer } = req.body;

    const result = await pool.query(
      `
      INSERT INTO answers (question_id, answer)
      VALUES ($1, $2)
      RETURNING *
      `,
      [question_id, answer]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err.message);

    res.status(500).send('Server Error');
  }
});


// ===============================
// START SERVER
// ===============================
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});