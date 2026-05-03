import request from './request';

/**
 * 创建订单
 */
export function createOrder(data) {
  return request.post('/orders/create', data);
}

/**
 * 获取订单详情
 */
export function getOrder(orderId) {
  return request.get(`/orders/${orderId}`);
}

/**
 * 获取订单列表
 */
export function getOrders(params) {
  return request.get('/orders', { params });
}

/**
 * 取消订单
 */
export function cancelOrder(orderId) {
  return request.post(`/orders/${orderId}/cancel`);
}
