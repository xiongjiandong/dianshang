const axios = require('axios');
const paypalConfig = require('../config/paypal');

class PayPalClient {
  constructor() {
    this.config = paypalConfig.current;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken() {
    // Token有效则复用
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await axios({
        method: 'post',
        url: `${this.config.apiBase}/v1/oauth2/token`,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
      });

      this.accessToken = response.data.access_token;
      // 提前5分钟过期
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('获取PayPal访问令牌失败:', error.response?.data || error.message);
      throw new Error('PayPal认证失败');
    }
  }

  /**
   * 发送API请求
   */
  async request(method, path, data = null) {
    const token = await this.getAccessToken();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const config = {
        method,
        url: `${this.config.apiBase}${path}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': requestId
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      console.error('PayPal API请求失败:', {
        path,
        status: error.response?.status,
        error: errorData
      });
      throw this.handleApiError(errorData);
    }
  }

  /**
   * 处理API错误
   */
  handleApiError(errorData) {
    if (!errorData || !errorData.details) {
      const error = new Error('PayPal请求失败');
      error.code = 'PAYPAL_ERROR';
      return error;
    }

    const details = errorData.details[0];
    const error = new Error(details.description || details.issue);
    error.code = details.issue;
    error.paypalError = errorData;
    return error;
  }

  /**
   * 验证Webhook签名
   */
  async verifyWebhookSignature(headers, body) {
    try {
      const payload = {
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_id: paypalConfig.webhookId,
        webhook_event: body
      };

      const response = await this.request(
        'POST',
        '/v1/notifications/verify-webhook-signature',
        payload
      );

      return response.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Webhook验证失败:', error);
      return false;
    }
  }
}

// 单例
const paypalClient = new PayPalClient();
module.exports = paypalClient;
