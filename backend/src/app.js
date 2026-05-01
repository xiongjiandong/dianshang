const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 只在本地开发时加载 dotenv
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  require('dotenv').config();
}

// 导入模型
const { sequelize } = require('./models');

// 导入路由
const routes = require('./routes');

// 创建Express应用
const app = express();

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接状态跟踪
let dbConnected = false;

// 数据库连接中间件
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await sequelize.authenticate();
      dbConnected = true;
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error.message);
      return res.status(503).json({
        success: false,
        message: '数据库连接失败，请稍后重试',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }
  }
  next();
});

// API路由
app.use('/api', routes);

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString(), db: 'disconnected' });
  }
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

// 启动服务器（仅本地开发）
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  async function startServer() {
    try {
      await sequelize.authenticate();
      dbConnected = true;
      console.log('数据库连接成功');

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
