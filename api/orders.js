// 订单创建 - 独立轻量级serverless函数
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres.bqgvqyzsnobkxitkjtno',
  password: process.env.DB_PASSWORD || 'xjd520521521YX',
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 1,
  min: 0
});

function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ORD${y}${m}${d}${rand}`;
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) return resolve(req.body);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // 只处理 POST（创建订单），GET/getOrder 转发到 Express
  if (req.method !== 'POST') {
    const app = require('../backend/src/app');
    return app(req, res);
  }

  try {
    const body = await parseBody(req);
    const { items, shippingAddress, currency, notes } = body;

    // 参数验证
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendJson(res, 400, { success: false, message: '商品列表不能为空' });
    }
    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.address) {
      return sendJson(res, 400, { success: false, message: '收货信息不完整' });
    }
    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || !item.price) {
        return sendJson(res, 400, { success: false, message: '商品信息无效' });
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = randomUUID();
    const orderNo = generateOrderNo();

    console.log('Creating order:', orderId, orderNo);

    // 测试数据库连接
    try {
      await pool.query('SELECT 1');
      console.log('DB connection OK');
    } catch (dbErr) {
      console.error('DB connection failed:', dbErr.message);
      return sendJson(res, 500, { success: false, message: '数据库连接失败: ' + dbErr.message });
    }

    // 插入订单
    const result = await pool.query(
      `INSERT INTO orders (id, order_no, user_id, subtotal, total_amount, currency, status,
       recipient_name, phone, address, city, state, postal_code, country, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING id`,
      [
        orderId, orderNo, null, subtotal, subtotal, currency || 'USD',
        shippingAddress.recipientName, shippingAddress.phone, shippingAddress.address,
        shippingAddress.city || null, shippingAddress.state || null,
        shippingAddress.postalCode || null, shippingAddress.country || 'US',
        notes || null
      ]
    );
    console.log('Order inserted:', result.rows[0].id);

    // 插入订单项
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [randomUUID(), orderId, item.productId, item.productName, item.quantity, item.price, item.price * item.quantity]
      );
    }
    console.log('Order items inserted');

    sendJson(res, 201, {
      success: true,
      data: { orderId, orderNo, totalAmount: subtotal, currency: currency || 'USD', status: 'pending' },
      message: '订单创建成功'
    });

  } catch (error) {
    console.error('Order creation error:', error.message);
    console.error('Error detail:', error.detail);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    sendJson(res, 500, {
      success: false,
      message: error.message || '订单创建失败',
      detail: error.detail || '',
      code: error.code || ''
    });
  }
};
