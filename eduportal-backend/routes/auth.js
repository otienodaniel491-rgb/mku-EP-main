const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

const VALID_COURSES = ['BIT', 'BBIT', 'BCE', 'BAI'];
const VALID_GENDERS = ['male', 'female', 'other'];

function signToken(student) {
    return jwt.sign(
        { registrationNumber: student.registration_number, fullName: student.full_name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function generateRegistrationNumber(courseCode) {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${courseCode}/${year}/${random}`;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, dob, gender, course, password } = req.body;

        if (!fullName || !email || !dob || !gender || !course || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (!VALID_COURSES.includes(course)) {
            return res.status(400).json({ error: 'Invalid course selected.' });
        }
        if (!VALID_GENDERS.includes(gender)) {
            return res.status(400).json({ error: 'Invalid gender selected.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM eduportal_students WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const registrationNumber = generateRegistrationNumber(course);
        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO eduportal_students
             (registration_number, full_name, email, date_of_birth, gender, course_code, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [registrationNumber, fullName, email, dob, gender, course, passwordHash]
        );

        const token = signToken({ registration_number: registrationNumber, full_name: fullName });

        res.status(201).json({
            message: 'Registration successful.',
            registrationNumber,
            token,
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { registrationNumber, password } = req.body;

        if (!registrationNumber || !password) {
            return res.status(400).json({ error: 'Registration number and password are required.' });
        }

        const [rows] = await pool.query(
            'SELECT registration_number, full_name, password_hash FROM eduportal_students WHERE registration_number = ?',
            [registrationNumber]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid registration number or password.' });
        }

        const student = rows[0];
        const passwordMatches = await bcrypt.compare(password, student.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid registration number or password.' });
        }

        const token = signToken(student);

        res.json({
            message: 'Login successful.',
            fullName: student.full_name,
            registrationNumber: student.registration_number,
            token,
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

module.exports = router;