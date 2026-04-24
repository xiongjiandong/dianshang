const { Order, OrderItem, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  /**
   * 生成订单号
   */
  generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `ORD${year}${month}${day}${random}`;
  }

  /**
   * 创建订单
   */
  async createOrder(orderData) {
    const { items, shippingAddress, currency, notes, userId } = orderData;

    // 计算总金额
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const totalAmount = subtotal;

    // 创建订单
    const order = await Order.create({
      orderNo: this.generateOrderNo(),
      userId: userId || null,
      subtotal,
      totalAmount,
      currency: currency || 'USD',
      status: 'pending',
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      notes
    });

    // 创建订单项
    const orderItems = await Promise.all(
      items.map(item => OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))
    );

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      items: orderItems
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    return order;
  }

  /**
   * 根据订单号获取订单
   */
  async getOrderByNo(orderNo) {
    return await Order.findOne({
      where: { orderNo }
    });
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(orderId, status, extraData = {}) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    const updateData = { status, ...extraData };

    // 设置时间戳
    if (status === 'paid') {
      updateData.paidAt = new Date();
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    await order.update(updateData);
    return order;
  }

  /**
   * 获取用户订单列表
   */
  async getOrdersByUserId(userId, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Order.findAndCountAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset
    });

    return {
      total: count,
      page,
      pageSize,
      list: rows
    };
  }
}

module.exports = new OrderService();
