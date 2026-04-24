import request from './request';

/**
 * 创建PayPal支付订单
 */
export function createPaymentOrder(data) {
  return request.post('/payments/create-order', data);
}

/**
 * 捕获支付
 */
export function capturePayment(data) {
  return request.post('/payments/capture-order', data);
}

/**
 * 获取支付状态
 */
export function getPaymentStatus(orderId) {
  return request.get(`/payments/status/${orderId}`);
}
