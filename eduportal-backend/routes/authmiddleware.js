const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Please log in to continue.' });
    }

    try {
        req.student = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }
}

module.exports = requireAuth;