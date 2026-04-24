const express = require('express');
const router = express.Router();

// 导入子路由
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');

// 注册路由
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// API信息
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: '电商独立站 API',
      version: '1.0.0',
      endpoints: [
        'POST /api/orders - 创建订单',
        'GET /api/orders - 获取订单列表',
        'GET /api/orders/:id - 获取订单详情',
        'POST /api/orders/:id/cancel - 取消订单',
        'POST /api/payments/create-order - 创建支付订单',
        'POST /api/payments/capture-order - 捕获支付',
        'POST /api/payments/webhook - PayPal回调',
        'GET /api/payments/status/:orderId - 查询支付状态'
      ]
    }
  });
});

module.exports = router;
