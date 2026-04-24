const paypalService = require('../services/paypalService');
const orderService = require('../services/orderService');
const { Payment, PaymentLog, sequelize } = require('../models');

class PaymentController {
  /**
   * 创建PayPal支付订单
   * POST /api/payments/create-order
   */
  async createPaymentOrder(req, res, next) {
    try {
      const { orderId, returnUrl, cancelUrl } = req.body;
      const userId = req.user?.id;

      // 参数验证
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: '订单ID不能为空',
          errorCode: 'INVALID_REQUEST'
        });
      }

      // 获取订单
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
          message: '订单状态不允许支付',
          errorCode: 'INVALID_ORDER_STATUS'
        });
      }

      // 检查是否已有支付记录
      const existingPayment = await Payment.findOne({
        where: { orderId, status: 'pending' }
      });

      if (existingPayment && existingPayment.paypalOrderId) {
        // 检查PayPal订单是否仍然有效
        try {
          const paypalOrder = await paypalService.getOrder(existingPayment.paypalOrderId);
          if (paypalOrder.status === 'CREATED' || paypalOrder.status === 'APPROVED') {
            return res.json({
              success: true,
              data: {
                paypalOrderId: existingPayment.paypalOrderId,
                status: paypalOrder.status,
                approvalUrl: paypalService.getApprovalUrl(paypalOrder.links)
              }
            });
          }
        } catch (e) {
          // PayPal订单已过期，创建新的
        }
      }

      // 创建PayPal订单
      const paypalOrder = await paypalService.createOrder({
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        returnUrl,
        cancelUrl,
        description: `订单 ${order.orderNo}`
      });

      // 保存支付记录
      await Payment.create({
        id: require('uuid').v4(),
        orderId: order.id,
        paypalOrderId: paypalOrder.paypalOrderId,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'pending'
      });

      // 记录日志
      await PaymentLog.create({
        paymentId: paypalOrder.paypalOrderId,
        action: 'create',
        requestData: { orderId, returnUrl, cancelUrl },
        responseData: paypalOrder
      });

      res.json({
        success: true,
        data: paypalOrder
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 捕获支付
   * POST /api/payments/capture-order
   */
  async capturePayment(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { paypalOrderId } = req.body;

      if (!paypalOrderId) {
        return res.status(400).json({
          success: false,
          message: 'PayPal订单ID不能为空',
          errorCode: 'INVALID_REQUEST'
        });
      }

      // 获取支付记录
      const payment = await Payment.findOne({
        where: { paypalOrderId },
        include: [{ association: 'order' }]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: '支付记录不存在',
          errorCode: 'PAYMENT_NOT_FOUND'
        });
      }

      if (payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: '支付已被处理',
          errorCode: 'ORDER_ALREADY_CAPTURED'
        });
      }

      // 调用PayPal捕获
      const captureResult = await paypalService.captureOrder(paypalOrderId);

      // 更新支付记录
      await payment.update({
        status: 'completed',
        transactionId: captureResult.transactionId,
        payerEmail: captureResult.payer.email,
        payerName: captureResult.payer.name,
        payerId: captureResult.payer.payerId,
        paidAt: new Date()
      }, { transaction });

      // 更新订单状态
      await orderService.updateOrderStatus(payment.orderId, 'paid', {
        paidAt: new Date()
      });

      // 记录日志
      await PaymentLog.create({
        paymentId: paypalOrderId,
        action: 'capture',
        responseData: captureResult
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        data: {
          orderId: payment.orderId,
          paypalOrderId,
          transactionId: captureResult.transactionId,
          status: captureResult.status,
          amount: captureResult.amount,
          payer: captureResult.payer,
          paidAt: new Date().toISOString()
        }
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  /**
   * PayPal Webhook回调
   * POST /api/payments/webhook
   */
  async webhook(req, res, next) {
    try {
      const headers = req.headers;
      const body = req.body;

      // 验证签名
      const isValid = await paypalService.verifyWebhookSignature(headers, body);

      if (!isValid) {
        console.warn('Webhook签名验证失败');
        return res.status(401).json({
          success: false,
          message: '签名验证失败',
          errorCode: 'WEBHOOK_VERIFY_FAILED'
        });
      }

      const eventType = body.event_type;
      const resource = body.resource;

      // 记录日志
      await PaymentLog.create({
        paymentId: resource.id || body.id,
        action: 'webhook',
        eventType,
        requestData: headers,
        responseData: body
      });

      // 处理不同事件
      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handleCaptureCompleted(resource);
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          await this.handleCaptureDenied(resource);
          break;
        case 'PAYMENT.CAPTURE.REFUNDED':
          await this.handleRefund(resource);
          break;
        default:
          console.log(`未处理的Webhook事件: ${eventType}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook处理错误:', error);
      // 仍然返回200，避免PayPal重试
      res.json({ success: true });
    }
  }

  /**
   * 处理支付完成
   */
  async handleCaptureCompleted(resource) {
    const orderId = resource.custom_id;
    if (!orderId) return;

    const payment = await Payment.findOne({ where: { orderId } });
    if (payment && payment.status !== 'completed') {
      await payment.update({
        status: 'completed',
        transactionId: resource.id,
        paidAt: new Date()
      });

      await orderService.updateOrderStatus(orderId, 'paid');
    }
  }

  /**
   * 处理支付拒绝
   */
  async handleCaptureDenied(resource) {
    const orderId = resource.custom_id;
    if (!orderId) return;

    const payment = await Payment.findOne({ where: { orderId } });
    if (payment) {
      await payment.update({ status: 'failed' });
    }
  }

  /**
   * 处理退款
   */
  async handleRefund(resource) {
    // 退款处理逻辑
    console.log('退款事件:', resource);
  }

  /**
   * 查询支付状态
   * GET /api/payments/status/:orderId
   */
  async getPaymentStatus(req, res, next) {
    try {
      const { orderId } = req.params;

      const payment = await Payment.findOne({
        where: { orderId },
        order: [['createdAt', 'DESC']]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: '支付记录不存在',
          errorCode: 'PAYMENT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          orderId: payment.orderId,
          paypalOrderId: payment.paypalOrderId,
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          payerEmail: payment.payerEmail,
          paidAt: payment.paidAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
