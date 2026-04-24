const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

module.exports = {
  // 沙箱环境配置
  sandbox: {
    clientId: process.env.PAYPAL_SANDBOX_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET || '',
    apiBase: 'https://api-m.sandbox.paypal.com'
  },

  // 生产环境配置
  production: {
    clientId: process.env.PAYPAL_PRODUCTION_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_PRODUCTION_CLIENT_SECRET || '',
    apiBase: 'https://api-m.paypal.com'
  },

  // 获取当前环境配置
  get current() {
    return isProduction ? this.production : this.sandbox;
  },

  // Webhook ID
  get webhookId() {
    return isProduction
      ? process.env.PAYPAL_PRODUCTION_WEBHOOK_ID
      : process.env.PAYPAL_WEBHOOK_ID;
  },

  // 当前环境
  environment: isProduction ? 'production' : 'sandbox',

  // 是否为生产环境
  isProduction
};
