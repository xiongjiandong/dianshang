// PayPal支付捕获 - 独立serverless函数
const axios = require('axios');
const { Pool } = require('pg');

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
    const { paypalOrderId } = await parseBody(req);
    if (!paypalOrderId) return sendJson(res, 400, { success: false, message: 'PayPal订单ID不能为空' });

    const p = await pool.query('SELECT * FROM payments WHERE paypal_order_id = $1', [paypalOrderId]);
    if (p.rows.length === 0) return sendJson(res, 404, { success: false, message: '支付记录不存在' });
    const pmt = p.rows[0];
    if (pmt.status === 'completed') return sendJson(res, 400, { success: false, message: '支付已被处理' });

    const token = await getPPToken();
    const cap = await axios.post(`${ppCfg.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const capture = cap.data.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) return sendJson(res, 500, { success: false, message: '捕获失败：未找到捕获信息' });

    const payer = cap.data.payer || {};
    await pool.query(
      `UPDATE payments SET status='completed', paypal_transaction_id=$1,
       payer_email=$2, payer_name=$3, paypal_payer_id=$4, captured_at=NOW(), updated_at=NOW()
       WHERE paypal_order_id=$5`,
      [capture.id, payer.email_address||'',
       payer.name ? `${payer.name.given_name||''} ${payer.name.surname||''}`.trim() : '',
       payer.payer_id||'', paypalOrderId]
    );
    await pool.query("UPDATE orders SET status='paid', paid_at=NOW(), updated_at=NOW() WHERE id=$1", [pmt.order_id]);

    console.log('Payment captured:', capture.id);
    sendJson(res, 200, {
      success: true,
      data: {
        orderId: pmt.order_id, paypalOrderId, transactionId: capture.id,
        status: capture.status,
        amount: { value: capture.amount.value, currency: capture.amount.currency_code },
        payer: { payerId: payer.payer_id||'', email: payer.email_address||'',
                 name: payer.name ? `${payer.name.given_name||''} ${payer.name.surname||''}`.trim() : '' },
        paidAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('PayPal capture error:', err.message);
    sendJson(res, 500, { success: false, message: 'PayPal支付捕获失败: ' + (err.message || '') });
  }
};
