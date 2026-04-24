const orderService = require('../services/orderService');
const { Order, OrderItem } = require('../models');

class OrderController {
  /**
   * 创建订单
   * POST /api/orders
   */
  async createOrder(req, res, next) {
    try {
      const { items, shippingAddress, currency, notes } = req.body;
      const userId = req.user?.id || null;

      // 参数验证
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: '商品列表不能为空',
          errorCode: 'INVALID_PRODUCTS'
        });
      }

      if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.address) {
        return res.status(400).json({
          success: false,
          message: '收货信息不完整',
          errorCode: 'INVALID_ADDRESS'
        });
      }

      // 验证商品信息
      for (const item of items) {
        if (!item.productId || !item.productName || !item.quantity || !item.price) {
          return res.status(400).json({
            success: false,
            message: '商品信息无效',
            errorCode: 'INVALID_PRODUCT_DATA'
          });
        }
        if (item.quantity <= 0 || item.price <= 0) {
          return res.status(400).json({
            success: false,
            message: '商品数量或价格无效',
            errorCode: 'INVALID_PRODUCT_DATA'
          });
        }
      }

      const order = await orderService.createOrder({
        items,
        shippingAddress,
        currency,
        notes,
        userId
      });

      res.status(201).json({
        success: true,
        data: order,
        message: '订单创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取订单详情
   * GET /api/orders/:orderId
   */
  async getOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在',
          errorCode: 'ORDER_NOT_FOUND'
        });
      }

      // 权限验证（如果有用户系统）
      if (userId && order.userId && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此订单',
          errorCode: 'FORBIDDEN'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取订单列表
   * GET /api/orders
   */
  async getOrders(req, res, next) {
    try {
      const userId = req.user?.id;
      const { page = 1, pageSize = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '请先登录',
          errorCode: 'UNAUTHORIZED'
        });
      }

      const result = await orderService.getOrdersByUserId(userId, {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 取消订单
   * POST /api/orders/:orderId/cancel
   */
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: '订单不存在',
          errorCode: 'ORDER_NOT_FOUND'
        });
      }

      // 权限验证
      if (userId && order.userId && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权操作此订单',
          errorCode: 'FORBIDDEN'
        });
      }

      // 状态验证
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '只有待支付订单可以取消',
          errorCode: 'INVALID_ORDER_STATUS'
        });
      }

      await orderService.updateOrderStatus(orderId, 'cancelled');

      res.json({
        success: true,
        message: '订单已取消'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
