module.exports = {
  // 应用配置
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_BASE_URL || 'http://localhost:3069',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3068',
    siteName: process.env.SITE_NAME || 'My Store'
  },

  // 数据库配置 - 支持Supabase/PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'postgres',
    timezone: '+00:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d'
  },

  // PayPal配置
  paypal: require('./paypal')
};
