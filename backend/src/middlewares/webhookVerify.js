const paypalService = require('../services/paypalService');

/**
 * PayPal Webhook签名验证中间件
 */
async function webhookVerify(req, res, next) {
  try {
    const headers = {
      'paypal-transmission-id': req.headers['paypal-transmission-id'],
      'paypal-transmission-time': req.headers['paypal-transmission-time'],
      'paypal-cert-url': req.headers['paypal-cert-url'],
      'paypal-auth-algo': req.headers['paypal-auth-algo'],
      'paypal-transmission-sig': req.headers['paypal-transmission-sig']
    };

    // 检查必要头部
    if (!headers['paypal-transmission-id'] || !headers['paypal-transmission-sig']) {
      return res.status(401).json({
        success: false,
        message: '缺少必要的PayPal签名头',
        errorCode: 'WEBHOOK_VERIFY_FAILED'
      });
    }

    // 验证证书URL是否为PayPal域名
    const certUrl = headers['paypal-cert-url'];
    if (certUrl) {
      const url = new URL(certUrl);
      const validDomains = ['.paypal.com', '.paypalobjects.com'];
      const isValidDomain = validDomains.some(domain =>
        url.hostname.endsWith(domain)
      );

      if (!isValidDomain) {
        console.warn(`可疑的证书URL: ${certUrl}`);
        return res.status(401).json({
          success: false,
          message: '证书URL域名无效',
          errorCode: 'WEBHOOK_VERIFY_FAILED'
        });
      }
    }

    // 验证签名
    const isValid = await paypalService.verifyWebhookSignature(headers, req.body);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Webhook签名验证失败',
        errorCode: 'WEBHOOK_VERIFY_FAILED'
      });
    }

    next();
  } catch (error) {
    console.error('Webhook验证错误:', error);
    return res.status(401).json({
      success: false,
      message: 'Webhook验证失败',
      errorCode: 'WEBHOOK_VERIFY_FAILED'
    });
  }
}

module.exports = webhookVerify;
