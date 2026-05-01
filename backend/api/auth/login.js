// 独立的登录处理函数 - 不依赖完整应用
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 数据库配置
const sequelize = new Sequelize(
  'postgres',
  'postgres.bqgvqyzsnobkxitkjtno',
  'xjd520521521YX',
  {
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
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
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入邮箱和密码'
      });
    }

    // 查询用户
    const [results] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const user = results[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      'my-jwt-secret-key-12345678',
      { expiresIn: '7d' }
    );

    // 更新最后登录时间
    await sequelize.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      { replacements: [user.id] }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};
