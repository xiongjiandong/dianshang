const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Local authentication (email/password)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// 用户信息
router.get('/me', authController.getCurrentUser);

// 登出
router.post('/logout', authController.logout);

module.exports = router;
