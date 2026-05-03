// PayPal支付捕获 - 独立轻量级serverless函数
const axios = require('axios');
const { Pool } = require('pg');

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
  if (req.method !== 'POST') {
    const app = require('../../../backend/src/app');
    return app(req, res);
  }

  try {
    const body = await parseBody(req);
    const { paypalOrderId } = body;

    if (!paypalOrderId) {
      return sendJson(res, 400, { success: false, message: 'PayPal订单ID不能为空', errorCode: 'INVALID_REQUEST' });
    }

    // 查询支付记录
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE paypal_order_id = $1',
      [paypalOrderId]
    );

    if (paymentResult.rows.length === 0) {
      return sendJson(res, 404, { success: false, message: '支付记录不存在', errorCode: 'PAYMENT_NOT_FOUND' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status === 'completed') {
      return sendJson(res, 400, { success: false, message: '支付已被处理', errorCode: 'ORDER_ALREADY_CAPTURED' });
    }

    // 调用PayPal捕获
    console.log('Capturing PayPal order:', paypalOrderId);
    const paypalToken = await getPayPalToken();
    const captureRes = await axios.post(
      `${paypalApiBase}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${paypalToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const captureData = captureRes.data;
    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    if (!capture) {
      return sendJson(res, 500, { success: false, message: '支付捕获失败：未找到捕获信息', errorCode: 'CAPTURE_FAILED' });
    }

    const transactionId = capture.id;
    const payerEmail = captureData.payer?.email_address || '';
    const payerName = captureData.payer?.name
      ? `${captureData.payer.name.given_name || ''} ${captureData.payer.name.surname || ''}`.trim()
      : '';
    const payerId = captureData.payer?.payer_id || '';

    // 更新支付记录
    await pool.query(
      `UPDATE payments SET status = 'completed', paypal_transaction_id = $1,
       payer_email = $2, payer_name = $3, paypal_payer_id = $4,
       captured_at = NOW(), updated_at = NOW()
       WHERE paypal_order_id = $5`,
      [transactionId, payerEmail, payerName, payerId, paypalOrderId]
    );

    // 更新订单状态
    await pool.query(
      "UPDATE orders SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1",
      [payment.order_id]
    );

    // 记录日志
    await pool.query(
      `INSERT INTO payment_logs (payment_id, action, response_data, created_at)
       VALUES ($1, 'capture', $2, NOW())`,
      [paypalOrderId, JSON.stringify(captureData)]
    );

    console.log('Payment captured:', transactionId);

    sendJson(res, 200, {
      success: true,
      data: {
        orderId: payment.order_id,
        paypalOrderId,
        transactionId,
        status: capture.status,
        amount: {
          value: capture.amount.value,
          currency: capture.amount.currency_code
        },
        payer: {
          payerId,
          email: payerEmail,
          name: payerName
        },
        paidAt: new Date().toISOString()
      }
    });

  } catch (error) {
    const errMsg = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error('Payment capture error:', errMsg);
    console.error('Stack:', error.stack);
    sendJson(res, 500, {
      success: false,
      message: 'PayPal支付捕获失败: ' + (error.message || '未知错误'),
      errorCode: 'PAYPAL_CAPTURE_ERROR'
    });
  }
};
