const app = require('../backend/src/app');

// 包装错误处理，防止未捕获的异常导致Vercel日志红色错误
module.exports = (req, res) => {
  // Express应用本身处理请求，外层捕获任何未处理的同步错误
  try {
    return app(req, res);
  } catch (err) {
    console.error('Catch-all function error:', err.message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
    }
  }
};
