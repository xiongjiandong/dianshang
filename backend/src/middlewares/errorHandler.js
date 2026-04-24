/**
 * 通用错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // 已知的业务错误
  if (err.code) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      errorCode: err.code
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'VALIDATION_ERROR'
    });
  }

  // Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errorCode: 'DATABASE_ERROR'
    });
  }

  // PayPal API错误
  if (err.paypalError) {
    return res.status(400).json({
      success: false,
      message: err.message || 'PayPal API错误',
      errorCode: err.code || 'PAYPAL_API_ERROR'
    });
  }

  // 默认服务器错误
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : err.message,
    errorCode: 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;
