// 订单创建 - 独立serverless函数
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

let pool = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
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
  }
  return pool;
}

function sendJson(res, code, data) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) return resolve(req.body);
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function genOrderNo() {
  const n = new Date();
  const r = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ORD${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}${r}`;
}

module.exports = async (req, res) => {
  // 立即设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS预检
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // GET健康检查
  if (req.method === 'GET') {
    return sendJson(res, 200, { success: true, message: 'Orders endpoint is working', method: 'GET' });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { items, shippingAddress, currency, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendJson(res, 400, { success: false, message: '商品列表不能为空' });
    }
    if (!shippingAddress?.recipientName || !shippingAddress?.phone || !shippingAddress?.address) {
      return sendJson(res, 400, { success: false, message: '收货信息不完整' });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderId = randomUUID();
    const orderNo = genOrderNo();

    console.log('Creating order:', orderId, orderNo);

    await getPool().query(
      `INSERT INTO orders (id, order_no, user_id, subtotal, total_amount, currency, status,
       recipient_name, phone, address, city, state, postal_code, country, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())`,
      [orderId, orderNo, null, subtotal, subtotal, currency||'USD',
       shippingAddress.recipientName, shippingAddress.phone, shippingAddress.address,
       shippingAddress.city||null, shippingAddress.state||null,
       shippingAddress.postalCode||null, shippingAddress.country||'US', notes||null]
    );

    for (const item of items) {
      await getPool().query(
        `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        [randomUUID(), orderId, item.productId, item.productName, item.quantity, item.price, item.price*item.quantity]
      );
    }

    console.log('Order created OK:', orderId);
    sendJson(res, 201, {
      success: true,
      data: { orderId, orderNo, totalAmount: subtotal, currency: currency||'USD', status: 'pending' },
      message: '订单创建成功'
    });
  } catch (err) {
    console.error('Order create error:', err.message, err.detail, err.code);
    sendJson(res, 500, {
      success: false,
      message: err.message || '订单创建失败',
      detail: err.detail || '',
      code: err.code || ''
    });
  }
};
