// Vercel Serverless Handler - 原生Node.js响应
function sendJson(res, code, data) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  // 获取路径
  const url = (req.url || '').split('?')[0];
  const path = url.replace(/\/$/, '');
  console.log('Request:', req.method, path);

  // 测试端点
  if (path === '/api/test' || path === '/health' || path === '/api/health') {
    return sendJson(res, 200, { status: 'ok', message: 'Backend API is working!', timestamp: new Date().toISOString() });
  }

  // API 根路径
  if (path === '/api' || path === '/api/') {
    return sendJson(res, 200, { success: true, data: { name: 'E-commerce API', version: '1.0.0' } });
  }

  // 登录
  if (path === '/api/auth/login' && req.method === 'POST') {
    const handler = require('./auth/login');
    return handler(req, res);
  }

  // 注册
  if (path === '/api/auth/register' && req.method === 'POST') {
    const handler = require('./auth/register');
    return handler(req, res);
  }

  // 订单
  if (path === '/api/orders' || path === '/api/orders/') {
    const handler = require('./orders');
    return handler(req, res);
  }

  // 支付创建
  if (path === '/api/payments/create-order' && req.method === 'POST') {
    const handler = require('./payments-create');
    return handler(req, res);
  }

  // 支付捕获
  if (path === '/api/payments/capture-order' && req.method === 'POST') {
    const handler = require('./payments-capture');
    return handler(req, res);
  }

  // 404
  sendJson(res, 404, { success: false, message: 'API endpoint not found', path });
};
