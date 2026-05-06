// PayPal支付创建 - 独立serverless函数
const axios = require('axios');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres.bqgvqyzsnobkxitkjtno',
  password: process.env.DB_PASSWORD || 'xjd520521521YX',
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000, idleTimeoutMillis: 5000, max: 1, min: 0
});

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

const isProd = (process.env.NODE_ENV || 'production') === 'production';
const ppCfg = {
  clientId: isProd ? process.env.PAYPAL_PRODUCTION_CLIENT_ID : process.env.PAYPAL_SANDBOX_CLIENT_ID,
  secret: isProd ? process.env.PAYPAL_PRODUCTION_CLIENT_SECRET : process.env.PAYPAL_SANDBOX_CLIENT_SECRET,
  apiBase: isProd ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
};

let ppToken = null, ppTokenExp = 0;
async function getPPToken() {
  if (ppToken && Date.now() < ppTokenExp) return ppToken;
  const auth = Buffer.from(`${ppCfg.clientId}:${ppCfg.secret}`).toString('base64');
  const r = await axios.post(`${ppCfg.apiBase}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 8000
  });
  ppToken = r.data.access_token;
  ppTokenExp = Date.now() + (r.data.expires_in - 300) * 1000;
  return ppToken;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed' });
  }
  try {
    const { orderId, returnUrl, cancelUrl } = await parseBody(req);
    if (!orderId) return sendJson(res, 400, { success: false, message: '订单ID不能为空' });

    const o = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (o.rows.length === 0) return sendJson(res, 404, { success: false, message: '订单不存在' });
    const order = o.rows[0];
    if (order.status !== 'pending') return sendJson(res, 400, { success: false, message: '订单状态不允许支付' });

    const token = await getPPToken();
    const pp = await axios.post(`${ppCfg.apiBase}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId, custom_id: orderId,
        description: `订单 ${order.order_no}`,
        amount: { currency_code: order.currency || 'USD', value: parseFloat(order.total_amount).toFixed(2) }
      }],
      application_context: {
        brand_name: 'My Store', landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW',
        return_url: returnUrl || '', cancel_url: cancelUrl || ''
      }
    }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const po = pp.data;
    const approval = po.links?.find(l => l.rel === 'approve');

    await pool.query(
      `INSERT INTO payments (id, order_id, paypal_order_id, amount, currency, status, payment_method, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'pending','paypal',NOW(),NOW())`,
      [randomUUID(), orderId, po.id, order.total_amount, order.currency || 'USD']
    );

    console.log('PayPal order created:', po.id);
    sendJson(res, 200, {
      success: true,
      data: { paypalOrderId: po.id, status: po.status, approvalUrl: approval ? approval.href : null }
    });
  } catch (err) {
    console.error('PayPal create error:', err.message);
    sendJson(res, 500, { success: false, message: 'PayPal支付创建失败: ' + (err.message || '') });
  }
};
