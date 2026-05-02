// Google OAuth 登录入口 - 独立轻量级serverless函数
module.exports = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const host = req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const scope = 'openid email profile';
  const url = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  res.writeHead(302, { Location: url });
  res.end();
};
