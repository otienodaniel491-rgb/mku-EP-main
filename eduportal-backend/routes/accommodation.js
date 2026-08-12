const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('./authMiddleware');

const router = express.Router();

const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_ROOM_TYPES = ['single', 'double', 'quad'];

// POST /api/accommodation  (requires login)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { fullName, gender, campus, roomType } = req.body;
        const registrationNumber = req.student.registrationNumber; // trust the token, not the form

        if (!fullName || !gender || !campus || !roomType) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (!VALID_GENDERS.includes(gender)) {
            return res.status(400).json({ error: 'Invalid gender selected.' });
        }
        if (!VALID_ROOM_TYPES.includes(roomType)) {
            return res.status(400).json({ error: 'Invalid room type selected.' });
        }

        await pool.query(
            `INSERT INTO eduportal_accommodation_bookings
             (registration_number, full_name, gender, campus, room_type)
             VALUES (?, ?, ?, ?, ?)`,
            [registrationNumber, fullName, gender, campus, roomType]
        );

        res.status(201).json({ message: 'Accommodation booking submitted. Awaiting confirmation.' });
    } catch (err) {
        console.error('Accommodation booking error:', err.message);
        res.status(500).json({ error: 'Could not submit booking. Please try again.' });
    }
});

module.exports = router;