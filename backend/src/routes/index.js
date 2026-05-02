const express = require('express');
const router = express.Router();

// 导入子路由
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const authRoutes = require('./authRoutes');

// 注册路由
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// API信息
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'E-commerce API',
      version: '1.0.0',
      endpoints: [
        'GET /api/auth/google - Google login',
        'GET /api/auth/me - Get current user',
        'POST /api/orders - Create order',
        'GET /api/orders - Get order list',
        'POST /api/payments/create-order - Create payment',
        'POST /api/payments/capture-order - Capture payment'
      ]
    }
  });
});

module.exports = router;
