// 智能API路由 - 轻量路径直接用pg处理，其他交给Express
const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const axios = require('axios');

// 共享数据库连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres.bqgvqyzsnobkxitkjtno',
  password: process.env.DB_PASSWORD || 'xjd520521521YX',
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 2,
  min: 0
});

// Express app (lazy load)
let app = null;
function getApp() {
  if (!app) app = require('../backend/src/app');
  return app;
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ORD${y}${m}${d}${rand}`;
}

// PayPal配置
function getPayPalConfig() {
  const isProduction = (process.env.NODE_ENV || 'production') === 'production';
  return {
    clientId: isProduction
      ? process.env.PAYPAL_PRODUCTION_CLIENT_ID
      : process.env.PAYPAL_SANDBOX_CLIENT_ID,
    clientSecret: isProduction
      ? process.env.PAYPAL_PRODUCTION_CLIENT_SECRET
      : process.env.PAYPAL_SANDBOX_CLIENT_SECRET,
    apiBase: isProduction
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'
  };
}

let paypalToken = null;
let paypalTokenExpiry = 0;

async function getPayPalToken() {
  if (paypalToken && Date.now() < paypalTokenExpiry) return paypalToken;
  const cfg = getPayPalConfig();
  const auth = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
  const res = await axios.post(`${cfg.apiBase}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 8000
  });
  paypalToken = res.data.access_token;
  paypalTokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
  return paypalToken;
}

// ─── 订单创建处理 ───
async function handleCreateOrder(req, res) {
  const body = await parseBody(req);
  const { items, shippingAddress, currency, notes } = body;

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

  await pool.query(
    `INSERT INTO orders (id, order_no, user_id, subtotal, total_amount, currency, status,
     recipient_name, phone, address, city, state, postal_code, country, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
    [orderId, orderNo, null, subtotal, subtotal, currency || 'USD',
     shippingAddress.recipientName, shippingAddress.phone, shippingAddress.address,
     shippingAddress.city || null, shippingAddress.state || null,
     shippingAddress.postalCode || null, shippingAddress.country || 'US', notes || null]
  );

  for (const item of items) {
    await pool.query(
      `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [randomUUID(), orderId, item.productId, item.productName, item.quantity, item.price, item.price * item.quantity]
    );
  }

  console.log('Order created:', orderId);
  sendJson(res, 201, {
    success: true,
    data: { orderId, orderNo, totalAmount: subtotal, currency: currency || 'USD', status: 'pending' },
    message: '订单创建成功'
  });
}

// ─── 支付创建处理 ───
async function handleCreatePayment(req, res) {
  const body = await parseBody(req);
  const { orderId, returnUrl, cancelUrl } = body;

  if (!orderId) {
    return sendJson(res, 400, { success: false, message: '订单ID不能为空' });
  }

  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) {
    return sendJson(res, 404, { success: false, message: '订单不存在' });
  }
  const order = orderRes.rows[0];

  if (order.status !== 'pending') {
    return sendJson(res, 400, { success: false, message: '订单状态不允许支付' });
  }

  // 检查已有支付
  const existPay = await pool.query(
    "SELECT * FROM payments WHERE order_id = $1 AND status = 'pending'",
    [orderId]
  );
  if (existPay.rows.length > 0 && existPay.rows[0].paypal_order_id) {
    try {
      const cfg = getPayPalConfig();
      const token = await getPayPalToken();
      const check = await axios.get(`${cfg.apiBase}/v2/checkout/orders/${existPay.rows[0].paypal_order_id}`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      if (check.data.status === 'CREATED' || check.data.status === 'APPROVED') {
        const link = check.data.links?.find(l => l.rel === 'approve');
        return sendJson(res, 200, {
          success: true,
          data: { paypalOrderId: existPay.rows[0].paypal_order_id, status: check.data.status, approvalUrl: link ? link.href : null }
        });
      }
    } catch (e) { /* 过期，创建新的 */ }
  }

  const cfg = getPayPalConfig();
  const token = await getPayPalToken();
  const ppRes = await axios.post(`${cfg.apiBase}/v2/checkout/orders`, {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderId,
      custom_id: orderId,
      description: `订单 ${order.order_no}`,
      amount: { currency_code: order.currency || 'USD', value: parseFloat(order.total_amount).toFixed(2) }
    }],
    application_context: {
      brand_name: 'My Store',
      landing_page: 'NO_PREFERENCE',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: returnUrl || '',
      cancel_url: cancelUrl || ''
    }
  }, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 10000
  });

  const ppOrder = ppRes.data;
  const approvalLink = ppOrder.links?.find(l => l.rel === 'approve');

  await pool.query(
    `INSERT INTO payments (id, order_id, paypal_order_id, amount, currency, status, payment_method, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', 'paypal', NOW(), NOW())`,
    [randomUUID(), orderId, ppOrder.id, order.total_amount, order.currency || 'USD']
  );

  console.log('PayPal order created:', ppOrder.id);
  sendJson(res, 200, {
    success: true,
    data: { paypalOrderId: ppOrder.id, status: ppOrder.status, approvalUrl: approvalLink ? approvalLink.href : null }
  });
}

// ─── 支付捕获处理 ───
async function handleCapturePayment(req, res) {
  const body = await parseBody(req);
  const { paypalOrderId } = body;

  if (!paypalOrderId) {
    return sendJson(res, 400, { success: false, message: 'PayPal订单ID不能为空' });
  }

  const payRes = await pool.query('SELECT * FROM payments WHERE paypal_order_id = $1', [paypalOrderId]);
  if (payRes.rows.length === 0) {
    return sendJson(res, 404, { success: false, message: '支付记录不存在' });
  }
  const payment = payRes.rows[0];

  if (payment.status === 'completed') {
    return sendJson(res, 400, { success: false, message: '支付已被处理' });
  }

  const cfg = getPayPalConfig();
  const token = await getPayPalToken();
  const capRes = await axios.post(`${cfg.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 15000
  });

  const capData = capRes.data;
  const capture = capData.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture) {
    return sendJson(res, 500, { success: false, message: '捕获失败：未找到捕获信息' });
  }

  await pool.query(
    `UPDATE payments SET status = 'completed', paypal_transaction_id = $1,
     payer_email = $2, payer_name = $3, paypal_payer_id = $4, captured_at = NOW(), updated_at = NOW()
     WHERE paypal_order_id = $5`,
    [capture.id, capData.payer?.email_address || '',
     capData.payer?.name ? `${capData.payer.name.given_name || ''} ${capData.payer.name.surname || ''}`.trim() : '',
     capData.payer?.payer_id || '', paypalOrderId]
  );

  await pool.query("UPDATE orders SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1", [payment.order_id]);

  console.log('Payment captured:', capture.id);
  sendJson(res, 200, {
    success: true,
    data: {
      orderId: payment.order_id, paypalOrderId, transactionId: capture.id,
      status: capture.status,
      amount: { value: capture.amount.value, currency: capture.amount.currency_code },
      payer: { payerId: capData.payer?.payer_id || '', email: capData.payer?.email_address || '',
               name: capData.payer?.name ? `${capData.payer.name.given_name || ''} ${capData.payer.name.surname || ''}`.trim() : '' },
      paidAt: new Date().toISOString()
    }
  });
}

// ─── 主入口: 智能路由 ───
module.exports = async (req, res) => {
  const url = req.url || '';
  const method = req.method || 'GET';

  // 解析路径 (去掉query string)
  const path = url.split('?')[0];

  try {
    // 轻量级路径: 直接处理，不加载Express
    if (method === 'POST' && path === '/api/orders') {
      return await handleCreateOrder(req, res);
    }
    if (method === 'POST' && path === '/api/payments/create-order') {
      return await handleCreatePayment(req, res);
    }
    if (method === 'POST' && path === '/api/payments/capture-order') {
      return await handleCapturePayment(req, res);
    }

    // 其他请求: 交给Express
    return getApp()(req, res);

  } catch (error) {
    console.error('API error:', error.message);
    console.error('Stack:', error.stack);
    if (!res.headersSent) {
      sendJson(res, 500, { success: false, message: error.message || '服务器内部错误' });
    }
  }
};
