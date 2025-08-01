const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.get('/profile', protect, getUserProfile);

module.exports = router;