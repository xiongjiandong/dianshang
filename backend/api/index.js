// 最简单的 Vercel Serverless Handler
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

  // 简单测试端点
  if (req.url === '/api/test' || req.url === '/api/test/') {
    res.status(200).json({
      status: 'ok',
      message: 'Backend API is working!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 对于其他请求，加载完整应用
  try {
    const app = require('../src/app');
    return app(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
