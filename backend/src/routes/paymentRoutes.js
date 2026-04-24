const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { body, param } = require('express-validator');

// 验证中间件
const validateCreatePayment = [
  body('orderId').isUUID().withMessage('订单ID格式无效')
];

const validateCapture = [
  body('paypalOrderId').notEmpty().withMessage('PayPal订单ID不能为空')
];

const validateOrderId = [
  param('orderId').isUUID().withMessage('订单ID格式无效')
];

// 路由定义
router.post('/create-order', validateCreatePayment, paymentController.createPaymentOrder);
router.post('/capture-order', validateCapture, paymentController.capturePayment);
router.post('/webhook', paymentController.webhook);
router.get('/status/:orderId', validateOrderId, paymentController.getPaymentStatus);

module.exports = router;
