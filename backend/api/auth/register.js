// 独立的注册处理函数 - 优化数据库连接
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 数据库配置 - 添加连接池和超时设置
const sequelize = new Sequelize(
  'postgres',
  'postgres.bqgvqyzsnobkxitkjtno',
  'xjd520521521YX',
  {
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
      connectTimeout: 10000
    },
    logging: false,
    pool: {
      max: 2,
      min: 0,
      idle: 10000,
      acquire: 15000
    }
  }
);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱和密码'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少6位'
      });
    }

    console.log('Register attempt for:', email);

    // 测试数据库连接
    try {
      await sequelize.authenticate();
      console.log('Database connected');
    } catch (dbError) {
      console.error('Database connection error:', dbError.message);
      return res.status(503).json({
        success: false,
        message: '数据库连接失败，请稍后重试'
      });
    }

    // 检查用户是否存在
    const [existing] = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已注册'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = uuidv4();
    await sequelize.query(
      `INSERT INTO users (id, email, password, name, provider, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'local', NOW(), NOW())`,
      { replacements: [userId, email, hashedPassword, name || 'User'] }
    );

    // 生成 token
    const token = jwt.sign(
      { userId, email, name: name || 'User' },
      'my-jwt-secret-key-12345678',
      { expiresIn: '7d' }
    );

    console.log('Registration successful for:', email);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: userId,
          email,
          name: name || 'User'
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};
