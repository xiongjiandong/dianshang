const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { Pool } = require('pg');
const config = require('../config');

// Serverless优化：轻量级pg连接池
const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 2,
  min: 0
});

// OAuth配置
const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile'
  }
};

// 从请求中获取当前域名，用于构建OAuth回调URL
function getBaseUrl(req) {
  const host = req.headers.host || req.headers['x-forwarded-host'];
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

// 生成JWT Token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// Google OAuth - 登录入口
exports.googleLogin = (req, res) => {
  const { clientId, authUrl, scope } = oauthConfig.google;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
};

// Google OAuth - 回调处理（使用轻量级pg，适合serverless）
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, tokenUrl, userInfoUrl } = oauthConfig.google;
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!code) {
      return res.redirect(`${baseUrl}/login?error=no_code`);
    }

    // 获取access token
    const tokenResponse = await axios.post(tokenUrl, {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // 获取用户信息
    const userResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, email, name, picture } = userResponse.data;
    const googleId = String(id);

    // 查找或创建用户（轻量级pg查询）
    const existing = await pool.query(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      ['google', googleId]
    );

    let user;
    if (existing.rows.length > 0) {
      // 更新已有用户
      user = existing.rows[0];
      await pool.query(
        `UPDATE users SET name = $1, avatar = $2, access_token = $3, last_login_at = $4, updated_at = NOW()
         WHERE id = $5`,
        [name || user.name, picture || user.avatar, access_token, new Date(), user.id]
      );
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
    } else {
      // 创建新用户
      const userId = randomUUID();
      await pool.query(
        `INSERT INTO users (id, email, name, avatar, provider, provider_id, access_token, last_login_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'google', $5, $6, NOW(), NOW(), NOW())`,
        [userId, email, name || 'Google User', picture, googleId, access_token]
      );
      user = { id: userId, email, name: name || 'Google User', avatar: picture };
    }

    const token = generateToken(user);

    // 重定向到前端（同域名）
    res.redirect(`${baseUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }))}`);

  } catch (error) {
    console.error('Google OAuth error:', error.message);
    const baseUrl = getBaseUrl(req);
    res.redirect(`${baseUrl}/login?error=auth_failed`);
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// 登出
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// 用户名密码注册（使用轻量级pg）
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // 检查用户是否已存在
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // 创建用户
    await pool.query(
      `INSERT INTO users (id, email, password, name, provider, provider_id, last_login_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'local', $1, NOW(), NOW(), NOW())`,
      [userId, email, hashedPassword, name || email.split('@')[0]]
    );

    const user = { id: userId, email, name: name || email.split('@')[0] };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { token, user }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// 用户名密码登录（使用轻量级pg）
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // 查找用户
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // 检查认证方式
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please login with ' + user.provider });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 更新最后登录时间
    await pool.query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user);

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
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};
