const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const config = require('../config');

const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 2,
  min: 0
});

class OrderService {
  generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ORD${year}${month}${day}${random}`;
  }

  async createOrder(orderData) {
    const { items, shippingAddress, currency, notes, userId } = orderData;

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const orderId = randomUUID();
    const orderNo = this.generateOrderNo();

    await pool.query(
      `INSERT INTO orders (id, order_no, user_id, subtotal, total_amount, currency, status,
       recipient_name, phone, address, city, state, postal_code, country, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
      [
        orderId, orderNo, userId || null, subtotal, subtotal, currency || 'USD',
        shippingAddress.recipientName, shippingAddress.phone, shippingAddress.address,
        shippingAddress.city || null, shippingAddress.state || null,
        shippingAddress.postalCode || null, shippingAddress.country || 'US', notes || null
      ]
    );

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [randomUUID(), orderId, item.productId, item.productName, item.quantity, item.price, item.price * item.quantity]
      );
    }

    return {
      orderId,
      orderNo,
      totalAmount: subtotal,
      currency: currency || 'USD',
      status: 'pending'
    };
  }

  async getOrderById(orderId) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) return null;
    const order = result.rows[0];
    const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    order.items = items.rows;
    return order;
  }

  async getOrderByNo(orderNo) {
    const result = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
    return result.rows[0] || null;
  }

  async updateOrderStatus(orderId, status, extraData = {}) {
    const now = new Date();
    let paidAt = extraData.paidAt || null;
    if (status === 'paid') paidAt = paidAt || now;

    await pool.query(
      `UPDATE orders SET status = $1, paid_at = $2, updated_at = NOW() WHERE id = $3`,
      [status, paidAt, orderId]
    );
  }

  async getOrdersByUserId(userId, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;

    const countRes = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, pageSize, offset]
    );

    return { total, page, pageSize, list: result.rows };
  }
}

module.exports = new OrderService();
