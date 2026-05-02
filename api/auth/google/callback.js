// Google OAuth 回调处理 - 独立轻量级serverless函数
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { parse } = require('url');
const querystring = require('querystring');

// 轻量级pg连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres.bqgvqyzsnobkxitkjtno',
  password: process.env.DB_PASSWORD || 'xjd520521521YX',
  host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
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

function redirect(res, url) {
  res.writeHead(302, { Location: url });
  res.end();
}

module.exports = async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const query = parse(req.url, true).query;
  const { code, error: googleError } = query;

  // Google返回了错误（用户取消授权等）
  if (googleError) {
    console.error('Google returned error:', googleError);
    return redirect(res, `${baseUrl}/login?error=${encodeURIComponent(googleError)}`);
  }

  if (!code) {
    console.error('No code in callback');
    return redirect(res, `${baseUrl}/login?error=no_code`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
      return redirect(res, `${baseUrl}/login?error=google_config_missing`);
    }

    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    console.log('Host:', req.headers.host, 'Proto:', req.headers['x-forwarded-proto']);
    console.log('Redirect URI:', redirectUri);

    // 1. 用code换access_token（使用form编码，Google要求）
    let tokenRes;
    try {
      tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        querystring.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 8000,
          validateStatus: () => true  // 不抛异常，手动处理错误
        }
      );
    } catch (networkErr) {
      console.error('Token endpoint network error:', networkErr.message);
      return redirect(res, `${baseUrl}/login?error=google_network&detail=${encodeURIComponent(networkErr.message)}`);
    }

    // 检查Google返回的HTTP状态和错误
    if (tokenRes.status !== 200 || tokenRes.data.error) {
      const googleErr = tokenRes.data.error || 'unknown';
      const googleErrDesc = tokenRes.data.error_description || '';
      console.error('Google token error:', googleErr, googleErrDesc, 'HTTP', tokenRes.status);
      console.error('Full response:', JSON.stringify(tokenRes.data));
      return redirect(res, `${baseUrl}/login?error=google_${encodeURIComponent(googleErr)}&detail=${encodeURIComponent(googleErrDesc)}`);
    }

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      console.error('No access_token in response:', JSON.stringify(tokenRes.data));
      return redirect(res, `${baseUrl}/login?error=no_access_token`);
    }

    console.log('Got access token, fetching user info...');

    // 2. 获取用户信息
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 8000
    });

    const { id, email, name, picture } = userRes.data;
    console.log('User info from Google:', email, name);
    const googleId = String(id);

    // 3. 查找或创建用户
    console.log('Querying database...');
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
      console.log('Updated existing user:', user.id);
    } else {
      const userId = `google_${googleId}`;
      await pool.query(
        `INSERT INTO users (id, email, name, avatar, provider, provider_id, access_token, last_login_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'google', $5, $6, NOW(), NOW(), NOW())`,
        [userId, email, name || 'Google User', picture, googleId, accessToken]
      );
      user = { id: userId, email, name: name || 'Google User', avatar: picture };
      console.log('Created new user:', userId);
    }

    // 4. 生成JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'my-jwt-secret-key-12345678',
      { expiresIn: '7d' }
    );

    // 5. 重定向到前端
    const userParam = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }));

    console.log('Login success, redirecting to frontend');
    redirect(res, `${baseUrl}/auth/callback?token=${token}&user=${userParam}`);

  } catch (error) {
    const errMsg = error.response?.data
      ? JSON.stringify(error.response.data)
      : (error.message || String(error));
    console.error('Google callback unexpected error:', errMsg);
    console.error('Error stack:', error.stack);
    redirect(res, `${baseUrl}/login?error=auth_failed&detail=${encodeURIComponent(errMsg)}`);
  }
};
