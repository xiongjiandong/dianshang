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

  const url = req.url || '';

  // 测试端点
  if (url === '/api/test' || url === '/api/test/' || url === '/health') {
    res.status(200).json({
      status: 'ok',
      message: 'Backend API is working!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 登录端点
  if (url === '/api/auth/login' && req.method === 'POST') {
    const loginHandler = require('./auth/login');
    return loginHandler(req, res);
  }

  // 注册端点
  if (url === '/api/auth/register' && req.method === 'POST') {
    const registerHandler = require('./auth/register');
    return registerHandler(req, res);
  }

  // 其他请求返回 404
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
};
