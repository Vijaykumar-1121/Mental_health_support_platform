const jwt = require('jsonwebtoken');
const User = require('../models/User.js');



const protect = async (req, res, next) => {
    let token;

    if (req.header('x-auth-token')) {
        try {
            token = req.header('x-auth-token');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.user.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ msg: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };