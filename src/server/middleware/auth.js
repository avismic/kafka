/**
 * server/middleware/auth.js
 * High-performance JWT Verification
 */
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.hotelId = verified.id; // Inject the Hotel ID for Shared Table Strategy
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};