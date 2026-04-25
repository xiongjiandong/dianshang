const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OAuth
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// GitHub OAuth
router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubCallback);

// Microsoft OAuth
router.get('/microsoft', authController.microsoftLogin);
router.get('/microsoft/callback', authController.microsoftCallback);

// 用户信息
router.get('/me', authController.getCurrentUser);

// 登出
router.post('/logout', authController.logout);

module.exports = router;
