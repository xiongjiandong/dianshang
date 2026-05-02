// Google OAuth 回调处理 - 独立轻量级serverless函数
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { parse } = require('url');

// 轻量级pg连接池
const pool = new Pool({
  user: 'postgres.bqgvqyzsnobkxitkjtno',
  password: 'xjd520521521YX',
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  max: 1,
  min: 0
});

function getBaseUrl(req) {
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const query = parse(req.url, true).query;
  const { code } = query;

  if (!code) {
    res.writeHead(302, { Location: `${baseUrl}/login?error=no_code` });
    return res.end();
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // 1. 用code换access_token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }, { timeout: 8000 });

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      throw new Error('No access token in response');
    }

    // 2. 获取用户信息
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000
    });

    const { id, email, name, picture } = userRes.data;
    const googleId = String(id);

    // 3. 查找或创建用户
    const existing = await pool.query(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      ['google', googleId]
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await pool.query(
        'UPDATE users SET name = $1, avatar = $2, access_token = $3, last_login_at = NOW(), updated_at = NOW() WHERE id = $4',
        [name || user.name, picture || user.avatar, accessToken, user.id]
      );
      user.name = name || user.name;
      user.avatar = picture || user.avatar;
    } else {
      const userId = `google_${googleId}`;
      await pool.query(
        `INSERT INTO users (id, email, name, avatar, provider, provider_id, access_token, last_login_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'google', $5, $6, NOW(), NOW(), NOW())`,
        [userId, email, name || 'Google User', picture, googleId, accessToken]
      );
      user = { id: userId, email, name: name || 'Google User', avatar: picture };
    }

    // 4. 生成JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      'my-jwt-secret-key-12345678',
      { expiresIn: '7d' }
    );

    // 5. 重定向到前端
    const userParam = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }));

    res.writeHead(302, { Location: `${baseUrl}/auth/callback?token=${token}&user=${userParam}` });
    res.end();

  } catch (error) {
    console.error('Google callback error:', error.message);
    res.writeHead(302, { Location: `${baseUrl}/login?error=auth_failed` });
    res.end();
  }
};
