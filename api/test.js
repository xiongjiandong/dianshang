// 简单测试端点 - 验证Vercel路由是否正常工作
module.exports = async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    success: true,
    message: 'API routing works!',
    method: req.method,
    url: req.url
  }));
};
