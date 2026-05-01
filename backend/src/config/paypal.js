const env = process.env.NODE_ENV || 'production';
const isProduction = env === 'production';

module.exports = {
  // 沙箱环境配置
  sandbox: {
    clientId: process.env.PAYPAL_SANDBOX_CLIENT_ID || 'AYolbTKwExYFeTJcCNEYi2IhME-HaaTQXKZLkcg_MIBmGU-4kLRw6e8PAQYjFD_J_NKhJEdnem95mo73',
    clientSecret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET || 'EBTzwjSrzD_t5yIkafT_jLXhzDG62CbYyGwQJyje20XnBS60Q2M0rXrQDv070fz1b5_VyCgWgJNYXxpV',
    apiBase: 'https://api-m.sandbox.paypal.com'
  },

  // 生产环境配置 (暂时使用沙箱凭证，正式上线需要更换)
  production: {
    clientId: process.env.PAYPAL_PRODUCTION_CLIENT_ID || 'AYolbTKwExYFeTJcCNEYi2IhME-HaaTQXKZLkcg_MIBmGU-4kLRw6e8PAQYjFD_J_NKhJEdnem95mo73',
    clientSecret: process.env.PAYPAL_PRODUCTION_CLIENT_SECRET || 'EBTzwjSrzD_t5yIkafT_jLXhzDG62CbYyGwQJyje20XnBS60Q2M0rXrQDv070fz1b5_VyCgWgJNYXxpV',
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
