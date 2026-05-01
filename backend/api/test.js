// 简单测试端点 - 不连接数据库
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
};
