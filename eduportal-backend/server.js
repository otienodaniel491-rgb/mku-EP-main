require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const accommodationRoutes = require('./routes/accommodation');
const feesRoutes = require('./routes/fees');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'eduportal-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/accommodation', accommodationRoutes);
app.use('/api/fees', feesRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`EduPortal API running on http://localhost:${PORT}`);
});