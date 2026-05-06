// Vercel Serverless Handler - 简化路由
module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 获取路径（移除查询参数）
  const url = (req.url || '').split('?')[0];
  const path = url.replace(/\/$/, ''); // 移除末尾斜杠

  console.log('Request URL:', url, 'Path:', path, 'Method:', req.method);

  // 测试端点
  if (path === '/api/test' || path === '/health' || path === '/api/health') {
    res.status(200).json({
      status: 'ok',
      message: 'Backend API is working!',
      timestamp: new Date().toISOString(),
      path: path
    });
    return;
  }

  // API 根路径
  if (path === '/api' || path === '/api/') {
    res.status(200).json({
      success: true,
      data: {
        name: 'E-commerce API',
        version: '1.0.0'
      }
    });
    return;
  }

  // 登录端点
  if (path === '/api/auth/login' && req.method === 'POST') {
    const loginHandler = require('./auth/login');
    return loginHandler(req, res);
  }

  // 注册端点
  if (path === '/api/auth/register' && req.method === 'POST') {
    const registerHandler = require('./auth/register');
    return registerHandler(req, res);
  }

  // 订单创建端点
  if ((path === '/api/orders' || path === '/api/orders/') && req.method === 'POST') {
    const ordersHandler = require('./orders');
    return ordersHandler(req, res);
  }

  // 订单健康检查
  if ((path === '/api/orders' || path === '/api/orders/') && req.method === 'GET') {
    return res.status(200).json({ success: true, message: 'Orders endpoint is working', method: 'GET' });
  }

  // 支付创建端点
  if (path === '/api/payments/create-order' && req.method === 'POST') {
    const paymentCreateHandler = require('./payments-create');
    return paymentCreateHandler(req, res);
  }

  // 支付捕获端点
  if (path === '/api/payments/capture-order' && req.method === 'POST') {
    const paymentCaptureHandler = require('./payments-capture');
    return paymentCaptureHandler(req, res);
  }

  // 其他请求返回 404
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: path,
    url: url
  });
};
