const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// OAuth配置
const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${config.app.apiUrl}/api/auth/google/callback`,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: `${config.app.apiUrl}/api/auth/github/callback`,
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: 'user:email'
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: `${config.app.apiUrl}/api/auth/microsoft/callback`,
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scope: 'openid email profile User.Read'
  }
};

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
  const { clientId, redirectUri, authUrl, scope } = oauthConfig.google;
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = oauthConfig.google;

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

    // 重定向到前端
    res.redirect(`${config.app.frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }))}`);

  } catch (error) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    res.redirect(`${config.app.frontendUrl}/login?error=auth_failed`);
  }
};

// GitHub OAuth
exports.githubLogin = (req, res) => {
  const { clientId, redirectUri, authUrl, scope } = oauthConfig.github;
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = oauthConfig.github;

    // 获取access token
    const tokenResponse = await axios.post(tokenUrl, {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    // 获取用户信息
    const userResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `token ${access_token}` }
    });

    const { id, email, name, avatar_url, login } = userResponse.data;

    const userEmail = email || `${login}@github.com`;
    const userName = name || login;

    // 创建或更新用户
    const [user] = await User.findOrCreate({
      where: { provider: 'github', providerId: String(id) },
      defaults: {
        id: `github_${id}`,
        email: userEmail,
        name: userName,
        avatar: avatar_url,
        provider: 'github',
        providerId: String(id),
        accessToken: access_token,
        lastLoginAt: new Date()
      }
    });

    if (!user.isNewRecord) {
      await user.update({
        name: userName,
        avatar: avatar_url,
        accessToken: access_token,
        lastLoginAt: new Date()
      });
    }

    const token = generateToken(user);

    res.redirect(`${config.app.frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }))}`);

  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.redirect(`${config.app.frontendUrl}/login?error=auth_failed`);
  }
};

// Microsoft OAuth
exports.microsoftLogin = (req, res) => {
  const { clientId, redirectUri, authUrl, scope } = oauthConfig.microsoft;
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&response_mode=query`;
  res.redirect(url);
};

exports.microsoftCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = oauthConfig.microsoft;

    // 获取access token
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    // 获取用户信息
    const userResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, mail, displayName, userPrincipalName } = userResponse.data;
    const email = mail || userPrincipalName;

    // 创建或更新用户
    const [user] = await User.findOrCreate({
      where: { provider: 'microsoft', providerId: String(id) },
      defaults: {
        id: `microsoft_${id}`,
        email,
        name: displayName,
        provider: 'microsoft',
        providerId: String(id),
        accessToken: access_token,
        lastLoginAt: new Date()
      }
    });

    if (!user.isNewRecord) {
      await user.update({
        name: displayName,
        accessToken: access_token,
        lastLoginAt: new Date()
      });
    }

    const token = generateToken(user);

    res.redirect(`${config.app.frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }))}`);

  } catch (error) {
    console.error('Microsoft OAuth error:', error.response?.data || error.message);
    res.redirect(`${config.app.frontendUrl}/login?error=auth_failed`);
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
