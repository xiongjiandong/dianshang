// 独立注册处理函数 - 使用轻量级 pg 客户端
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 数据库连接池
const pool = new Pool({
  user: 'postgres.bqgvqyzsnobkxitkjtno',
  password: 'xjd520521521YX',
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 10000,
  max: 1,
  min: 0
});

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
      return res.status(400).json({ success: false, message: '请输入邮箱和密码' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少6位' });
    }

    console.log('Register attempt:', email);

    // 检查用户是否存在
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: '该邮箱已注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password, name, provider, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'local', NOW(), NOW())`,
      [userId, email, hashedPassword, name || 'User']
    );

    // 生成 token
    const token = jwt.sign(
      { userId, email, name: name || 'User' },
      'my-jwt-secret-key-12345678',
      { expiresIn: '7d' }
    );

    console.log('Registration successful:', email);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { token, user: { id: userId, email, name: name || 'User' } }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
};
