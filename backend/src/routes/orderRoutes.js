const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { body, param, query } = require('express-validator');

// 验证中间件
const validateCreateOrder = [
  body('items').isArray({ min: 1 }).withMessage('商品列表不能为空'),
  body('items.*.productId').notEmpty().withMessage('商品ID不能为空'),
  body('items.*.productName').notEmpty().withMessage('商品名称不能为空'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('商品数量必须大于0'),
  body('items.*.price').isFloat({ min: 0.01 }).withMessage('商品价格必须大于0'),
  body('shippingAddress.recipientName').notEmpty().withMessage('收件人姓名不能为空'),
  body('shippingAddress.phone').notEmpty().withMessage('手机号不能为空'),
  body('shippingAddress.address').notEmpty().withMessage('地址不能为空')
];

const validateOrderId = [
  param('orderId').isUUID().withMessage('订单ID格式无效')
];

// 路由定义
router.post('/', validateCreateOrder, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', validateOrderId, orderController.getOrder);
router.post('/:orderId/cancel', validateOrderId, orderController.cancelOrder);

module.exports = router;
