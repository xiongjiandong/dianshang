// PayPal支付创建 - 独立轻量级serverless函数
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
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 1,
  min: 0
});

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

// PayPal配置
const isProduction = (process.env.NODE_ENV || 'production') === 'production';
const paypalClientId = isProduction
  ? process.env.PAYPAL_PRODUCTION_CLIENT_ID
  : process.env.PAYPAL_SANDBOX_CLIENT_ID;
const paypalSecret = isProduction
  ? process.env.PAYPAL_PRODUCTION_CLIENT_SECRET
  : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
const paypalApiBase = isProduction
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

console.log('PayPal environment:', isProduction ? 'production' : 'sandbox');

// 获取PayPal访问令牌
let cachedToken = null;
let tokenExpiry = 0;

async function getPayPalToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');
  const res = await axios.post(
    `${paypalApiBase}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 8000
    }
  );
  cachedToken = res.data.access_token;
  tokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
  return cachedToken;
}

module.exports = async (req, res) => {
  // 只处理POST请求
  if (req.method !== 'POST') {
    const app = require('../../../backend/src/app');
    return app(req, res);
  }

  try {
    const body = await parseBody(req);
    const { orderId, returnUrl, cancelUrl } = body;

    if (!orderId) {
      return sendJson(res, 400, { success: false, message: '订单ID不能为空', errorCode: 'INVALID_REQUEST' });
    }

    // 查询订单
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) {
      return sendJson(res, 404, { success: false, message: '订单不存在', errorCode: 'ORDER_NOT_FOUND' });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'pending') {
      return sendJson(res, 400, { success: false, message: '订单状态不允许支付', errorCode: 'INVALID_ORDER_STATUS' });
    }

    // 检查是否已有pending支付
    const existingPayment = await pool.query(
      "SELECT * FROM payments WHERE order_id = $1 AND status = 'pending'",
      [orderId]
    );

    if (existingPayment.rows.length > 0 && existingPayment.rows[0].paypal_order_id) {
      const paypalOrderId = existingPayment.rows[0].paypal_order_id;
      try {
        const token = await getPayPalToken();
        const paypalRes = await axios.get(`${paypalApiBase}/v2/checkout/orders/${paypalOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });
        if (paypalRes.data.status === 'CREATED' || paypalRes.data.status === 'APPROVED') {
          const approvalLink = paypalRes.data.links?.find(l => l.rel === 'approve');
          return sendJson(res, 200, {
            success: true,
            data: {
              paypalOrderId,
              status: paypalRes.data.status,
              approvalUrl: approvalLink ? approvalLink.href : null
            }
          });
        }
      } catch (e) {
        console.log('Existing PayPal order expired, creating new one');
      }
    }

    // 创建PayPal订单
    console.log('Creating PayPal order for:', orderId, 'amount:', order.total_amount);

    const paypalToken = await getPayPalToken();
    const paypalPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        custom_id: orderId,
        description: `订单 ${order.order_no}`,
        amount: {
          currency_code: order.currency || 'USD',
          value: parseFloat(order.total_amount).toFixed(2)
        }
      }],
      application_context: {
        brand_name: 'My Store',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `https://dianshang-o71u.vercel.app/payment/success`,
        cancel_url: cancelUrl || `https://dianshang-o71u.vercel.app/payment/cancel`
      }
    };

    const paypalRes = await axios.post(
      `${paypalApiBase}/v2/checkout/orders`,
      paypalPayload,
      {
        headers: {
          'Authorization': `Bearer ${paypalToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const paypalOrder = paypalRes.data;
    const approvalLink = paypalOrder.links?.find(l => l.rel === 'approve');

    // 保存支付记录
    const paymentId = randomUUID();
    await pool.query(
      `INSERT INTO payments (id, order_id, paypal_order_id, amount, currency, status, payment_method, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'paypal', NOW(), NOW())`,
      [paymentId, orderId, paypalOrder.id, order.total_amount, order.currency || 'USD']
    );

    // 记录日志
    await pool.query(
      `INSERT INTO payment_logs (payment_id, action, request_data, response_data, created_at)
       VALUES ($1, 'create', $2, $3, NOW())`,
      [paypalOrder.id, JSON.stringify({ orderId, returnUrl, cancelUrl }), JSON.stringify(paypalOrder)]
    );

    console.log('PayPal order created:', paypalOrder.id);

    sendJson(res, 200, {
      success: true,
      data: {
        paypalOrderId: paypalOrder.id,
        status: paypalOrder.status,
        approvalUrl: approvalLink ? approvalLink.href : null
      }
    });

  } catch (error) {
    const errMsg = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error('Payment create error:', errMsg);
    console.error('Stack:', error.stack);
    sendJson(res, 500, {
      success: false,
      message: 'PayPal支付创建失败: ' + (error.message || '未知错误'),
      errorCode: 'PAYPAL_CREATE_ERROR'
    });
  }
};
