require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');

// 导入路由
const routes = require('./routes');

// 创建Express应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// API路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    errorCode: err.code || 'INTERNAL_ERROR'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 只在非 Vercel 环境下启动服务器
if (require.main === module) {
  async function startServer() {
    try {
      // 测试数据库连接
      await sequelize.authenticate();
      console.log('数据库连接成功');

      // 启动服务
      app.listen(PORT, () => {
        console.log(`服务器运行在端口 ${PORT}`);
        console.log(`环境: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      console.error('启动失败:', error);
      process.exit(1);
    }
  }
  startServer();
}

module.exports = app;
