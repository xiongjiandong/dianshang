const paypalClient = require('../utils/paypalClient');
const config = require('../config');

class PayPalService {
  /**
   * 创建PayPal订单
   */
  async createOrder(orderData) {
    const { orderId, amount, currency, returnUrl, cancelUrl, description } = orderData;

    // 确保 amount 是数字类型
    const numAmount = parseFloat(amount);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          custom_id: orderId,
          description: description || `Order ${orderId}`,
          amount: {
            currency_code: currency || 'USD',
            value: numAmount.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: config.app.siteName,
        locale: 'en-US',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `${config.app.frontendUrl}/payment/success`,
        cancel_url: cancelUrl || `${config.app.frontendUrl}/payment/cancel`
      }
    };

    const response = await paypalClient.request('POST', '/v2/checkout/orders', payload);

    return {
      paypalOrderId: response.id,
      status: response.status,
      approvalUrl: this.getApprovalUrl(response.links)
    };
  }

  /**
   * 获取approval URL
   */
  getApprovalUrl(links) {
    const approvalLink = links?.find(link => link.rel === 'approve');
    return approvalLink ? approvalLink.href : null;
  }

  /**
   * 捕获支付
   */
  async captureOrder(paypalOrderId) {
    const response = await paypalClient.request(
      'POST',
      `/v2/checkout/orders/${paypalOrderId}/capture`
    );

    return this.parseCaptureResponse(response);
  }

  /**
   * 解析捕获响应
   */
  parseCaptureResponse(response) {
    const purchaseUnit = response.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    if (!capture) {
      throw new Error('支付捕获失败：未找到捕获信息');
    }

    return {
      paypalOrderId: response.id,
      transactionId: capture.id,
      status: capture.status,
      amount: {
        value: capture.amount.value,
        currency: capture.amount.currency_code
      },
      orderId: purchaseUnit.custom_id,
      payer: {
        payerId: response.payer?.payer_id,
        email: response.payer?.email_address,
        name: response.payer?.name
          ? `${response.payer.name.given_name || ''} ${response.payer.name.surname || ''}`.trim()
          : ''
      },
      createTime: response.create_time,
      updateTime: response.update_time
    };
  }

  /**
   * 查询PayPal订单
   */
  async getOrder(paypalOrderId) {
    return await paypalClient.request('GET', `/v2/checkout/orders/${paypalOrderId}`);
  }

  /**
   * 退款
   */
  async refund(captureId, refundData) {
    const numAmount = parseFloat(refundData.amount);
    const payload = {
      amount: {
        value: numAmount.toFixed(2),
        currency_code: refundData.currency || 'USD'
      },
      note_to_payer: refundData.note || 'Refund'
    };

    const response = await paypalClient.request(
      'POST',
      `/v2/payments/captures/${captureId}/refund`,
      payload
    );

    return {
      refundId: response.id,
      status: response.status,
      amount: {
        value: response.amount.value,
        currency: response.amount.currency_code
      }
    };
  }

  /**
   * 验证Webhook签名
   */
  async verifyWebhookSignature(headers, body) {
    return await paypalClient.verifyWebhookSignature(headers, body);
  }
}

module.exports = new PayPalService();
