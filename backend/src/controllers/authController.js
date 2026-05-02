const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { User } = require('../models');
const config = require('../config');

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

// Google OAuth
exports.googleLogin = (req, res) => {
  const { clientId, authUrl, scope } = oauthConfig.google;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, tokenUrl, userInfoUrl } = oauthConfig.google;
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

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

    // 创建或更新用户
    const [user] = await User.findOrCreate({
      where: { provider: 'google', providerId: String(id) },
      defaults: {
        id: `google_${id}`,
        email,
        name,
        avatar: picture,
        provider: 'google',
        providerId: String(id),
        accessToken: access_token,
        lastLoginAt: new Date()
      }
    });

    if (!user.isNewRecord) {
      await user.update({
        name,
        avatar: picture,
        accessToken: access_token,
        lastLoginAt: new Date()
      });
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
    console.error('Google OAuth error:', error.response?.data || error.message);
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

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

// 用户名密码注册
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    const user = await User.create({
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      provider: 'local',
      providerId: userId,
      lastLoginAt: new Date()
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// 用户名密码登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has password (local auth)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please login with ' + user.provider
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate token
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
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
