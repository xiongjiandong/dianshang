// Vercel Serverless Handler - 简化版本
const express = require('express');
const cors = require('cors');
const app = express();

// 基本中间件
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// 健康检查 - 不连接数据库
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 延迟加载数据库和路由
let appInitialized = false;
let fullApp = null;

async function initializeApp() {
  if (appInitialized) return fullApp;

  try {
    const { sequelize } = require('../src/models');
    const routes = require('../src/routes');

    await sequelize.authenticate();
    console.log('Database connected');

    app.use('/api', routes);
    appInitialized = true;
    fullApp = app;
    return app;
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

// 初始化中间件
app.use(async (req, res, next) => {
  if (!appInitialized && req.path !== '/api/test' && req.path !== '/health') {
    try {
      await initializeApp();
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: 'Service initializing, please try again',
        errorCode: 'SERVICE_INIT'
      });
    }
  }
  next();
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

module.exports = app;
