const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('./authMiddleware');

const router = express.Router();

const VALID_COURSES = ['BIT', 'BBIT', 'BCE', 'BAI'];
const VALID_METHODS = ['card', 'mpesa'];
const TUITION_FEE = 70000;
const STATUTORY_FEE = 10000;

// POST /api/fees  (requires login)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { fullName, course, semester, discount, paymentMethod, transactionId } = req.body;
        const studentId = req.student.registrationNumber; // trust the token, not the form

        if (!fullName || !course || !semester || !paymentMethod || !transactionId) {
            return res.status(400).json({ error: 'All required fields must be filled in.' });
        }
        if (!VALID_COURSES.includes(course)) {
            return res.status(400).json({ error: 'Invalid course selected.' });
        }
        if (!VALID_METHODS.includes(paymentMethod)) {
            return res.status(400).json({ error: 'Invalid payment method.' });
        }

        // Recalculate the total server-side — never trust a client-submitted total.
        const discountAmount = Number(discount) || 0;
        const totalAmount = (TUITION_FEE + STATUTORY_FEE - discountAmount).toFixed(2);

        await pool.query(
            `INSERT INTO eduportal_fee_records
             (student_id, full_name, course_code, semester, tuition_fee, statutory_fee, discount, total_amount, payment_method, transaction_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentId, fullName, course, semester, TUITION_FEE, STATUTORY_FEE, discountAmount, totalAmount, paymentMethod, transactionId]
        );

        res.status(201).json({ message: 'Fee record submitted successfully.', totalAmount });
    } catch (err) {
        console.error('Fee record error:', err.message);
        res.status(500).json({ error: 'Could not submit fee record. Please try again.' });
    }
});

module.exports = router;