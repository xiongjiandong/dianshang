module.exports = {
  // 应用配置
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'production',
    apiUrl: process.env.API_BASE_URL || 'https://www.shop123.online',
    frontendUrl: process.env.FRONTEND_URL || 'https://www.shop123.online',
    siteName: process.env.SITE_NAME || 'My Store'
  },

  // 数据库配置 - Supabase PostgreSQL
  database: {
    host: process.env.DB_HOST || 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres.bqgvqyzsnobkxitkjtno',
    password: process.env.DB_PASSWORD || 'xjd520521521YX',
    dialect: process.env.DB_DIALECT || 'postgres',
    timezone: '+00:00',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'my-jwt-secret-key-12345678',
    expiresIn: '7d'
  },

  // PayPal配置
  paypal: require('./paypal')
};
