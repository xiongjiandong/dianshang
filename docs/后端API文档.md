# 后端 API 文档

## 一、API 概述

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础URL | `http://localhost:3000/api` (开发) / `https://yourdomain.com/api` (生产) |
| 数据格式 | JSON |
| 编码 | UTF-8 |
| 认证方式 | JWT Bearer Token |

### 1.2 通用响应格式

**成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "错误描述",
  "errorCode": "ERROR_CODE"
}
```

---

## 二、订单接口

### 2.1 创建订单

创建一个新的订单。

**请求**：
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "items": [
    {
      "productId": "prod_001",
      "productName": "商品名称",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "recipientName": "张三",
    "phone": "13800138000",
    "address": "浦东新区xxx路xxx号",
    "city": "上海",
    "state": "上海市",
    "postalCode": "200000",
    "country": "CN"
  },
  "currency": "USD",
  "notes": "订单备注（可选）"
}
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | Array | 是 | 商品列表 |
| items[].productId | String | 是 | 商品ID |
| items[].productName | String | 是 | 商品名称 |
| items[].quantity | Integer | 是 | 数量 |
| items[].price | Number | 是 | 单价 |
| shippingAddress | Object | 是 | 收货地址 |
| currency | String | 否 | 货币，默认USD |

**成功响应**：
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNo": "ORD20240420001",
    "totalAmount": 59.98,
    "currency": "USD",
    "status": "pending",
    "createdAt": "2024-04-20T10:30:00Z"
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "商品信息无效",
  "errorCode": "INVALID_PRODUCTS"
}
```

---

### 2.2 获取订单详情

**请求**：
```http
GET /api/orders/:orderId
Authorization: Bearer {token}
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNo": "ORD20240420001",
    "items": [
      {
        "productId": "prod_001",
        "productName": "商品名称",
        "quantity": 2,
        "price": 29.99,
        "totalPrice": 59.98
      }
    ],
    "subtotal": 59.98,
    "shippingFee": 0,
    "totalAmount": 59.98,
    "currency": "USD",
    "status": "pending",
    "shippingAddress": {
      "recipientName": "张三",
      "phone": "13800138000",
      "address": "浦东新区xxx路xxx号",
      "city": "上海"
    },
    "createdAt": "2024-04-20T10:30:00Z",
    "paidAt": null
  }
}
```

---

## 三、支付接口

### 3.1 创建PayPal支付订单

创建PayPal支付订单，获取支付链接。

**请求**：
```http
POST /api/payments/create-order
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "returnUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | String | 是 | 订单ID |
| returnUrl | String | 否 | 支付成功回调URL |
| cancelUrl | String | 否 | 取消支付回调URL |

**成功响应**：
```json
{
  "success": true,
  "data": {
    "paypalOrderId": "5O190127TN364715T",
    "status": "CREATED",
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=5O190127TN364715T"
  }
}
```

**响应字段说明**：

| 字段 | 说明 |
|------|------|
| paypalOrderId | PayPal订单ID，用于后续捕获 |
| status | PayPal订单状态：CREATED |
| approvalUrl | 用户授权支付页面URL |

---

### 3.2 捕获支付

用户在PayPal授权后，调用此接口完成支付捕获。

**请求**：
```http
POST /api/payments/capture-order
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "paypalOrderId": "5O190127TN364715T"
}
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "paypalOrderId": "5O190127TN364715T",
    "transactionId": "6V832599GH958860F",
    "status": "COMPLETED",
    "amount": {
      "value": "59.98",
      "currency_code": "USD"
    },
    "payer": {
      "email": "buyer@example.com",
      "name": "John Doe",
      "payerId": "ABC123DEF456"
    },
    "paidAt": "2024-04-20T10:35:00Z"
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "支付已被处理或订单不存在",
  "errorCode": "ORDER_ALREADY_CAPTURED"
}
```

---

### 3.3 PayPal Webhook回调

PayPal服务器回调通知支付状态变更。

**请求**：
```http
POST /api/payments/webhook
Content-Type: application/json
PayPal-Transmission-Id: {transmission_id}
PayPal-Transmission-Time: {transmission_time}
PayPal-Transmission-Sig: {signature}
PayPal-Cert-Url: {cert_url}
PayPal-Auth-Algo: SHA256withRSA
```

**请求体**（PayPal Webhook Event）：
```json
{
  "id": "WH-2WR49377UY1234567",
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "create_time": "2024-04-20T10:35:00Z",
  "resource": {
    "id": "6V832599GH958860F",
    "status": "COMPLETED",
    "amount": {
      "value": "59.98",
      "currency_code": "USD"
    },
    "custom_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**支持的Webhook事件类型**：

| 事件类型 | 说明 |
|----------|------|
| PAYMENT.CAPTURE.COMPLETED | 支付成功 |
| PAYMENT.CAPTURE.DENIED | 支付被拒绝 |
| PAYMENT.CAPTURE.PENDING | 支付待处理 |
| PAYMENT.CAPTURE.REFUNDED | 已退款 |

**响应**：
```json
{
  "success": true
}
```

---

### 3.4 查询支付状态

查询订单的支付状态。

**请求**：
```http
GET /api/payments/status/:orderId
Authorization: Bearer {token}
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "paypalOrderId": "5O190127TN364715T",
    "transactionId": "6V832599GH958860F",
    "status": "completed",
    "amount": 59.98,
    "currency": "USD",
    "payerEmail": "buyer@example.com",
    "paidAt": "2024-04-20T10:35:00Z"
  }
}
```

---

## 四、错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| INVALID_REQUEST | 400 | 请求参数无效 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 无权限 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| PAYMENT_NOT_FOUND | 404 | 支付记录不存在 |
| ORDER_ALREADY_PAID | 400 | 订单已支付 |
| ORDER_ALREADY_CAPTURED | 400 | 支付已被捕获 |
| INVALID_ORDER_STATUS | 400 | 订单状态不允许此操作 |
| PAYPAL_API_ERROR | 500 | PayPal API调用失败 |
| WEBHOOK_VERIFY_FAILED | 401 | Webhook签名验证失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 五、后端代码结构

### 5.1 核心文件说明

```
backend/src/
├── config/
│   ├── index.js           # 配置入口
│   └── paypal.js          # PayPal配置
├── controllers/
│   ├── orderController.js # 订单控制器
│   └── paymentController.js # 支付控制器
├── routes/
│   ├── index.js           # 路由入口
│   └── paymentRoutes.js   # 支付路由
├── services/
│   ├── paypalService.js   # PayPal服务（核心）
│   └── orderService.js    # 订单服务
├── models/
│   ├── index.js           # 模型入口
│   ├── Order.js           # 订单模型
│   └── Payment.js         # 支付记录模型
├── middlewares/
│   └── webhookVerify.js   # Webhook验证中间件
└── utils/
    ├── paypalClient.js    # PayPal API客户端
    └── logger.js          # 日志工具
```

### 5.2 PayPal服务核心方法

```javascript
// paypalService.js 主要方法

class PayPalService {
  // 创建PayPal订单
  async createOrder(orderData) { ... }
  
  // 捕获支付
  async captureOrder(paypalOrderId) { ... }
  
  // 查询订单
  async getOrder(paypalOrderId) { ... }
  
  // 退款
  async refund(captureId, refundData) { ... }
  
  // 验证Webhook签名
  async verifyWebhookSignature(headers, body) { ... }
}
```

---

## 六、PayPal API 参考

### 6.1 常用API端点

| API | 端点 | 说明 |
|-----|------|------|
| 创建订单 | POST /v2/checkout/orders | 创建PayPal订单 |
| 获取订单 | GET /v2/checkout/orders/{id} | 获取订单详情 |
| 捕获支付 | POST /v2/checkout/orders/{id}/capture | 捕获授权支付 |
| 退款 | POST /v2/payments/captures/{id}/refund | 退款 |

### 6.2 订单状态流转

```
CREATED → APPROVED → COMPLETED
    ↓
  VOIDED（过期取消）
```

| 状态 | 说明 |
|------|------|
| CREATED | 订单已创建 |
| APPROVED | 用户已授权 |
| COMPLETED | 支付完成 |
| VOIDED | 订单已取消 |

---

## 七、安全注意事项

### 7.1 请求验证

1. **金额验证**：后端必须重新计算订单金额，不能信任前端传递的金额
2. **订单状态验证**：检查订单是否允许支付
3. **用户权限验证**：验证订单所属用户

### 7.2 Webhook安全

1. 验证签名来源是否为PayPal
2. 验证证书URL是否为PayPal域名
3. 实现幂等性处理，防止重复处理

### 7.3 敏感信息保护

```javascript
// .gitignore 必须包含
.env
.env.local
.env.production

// 日志中过滤敏感信息
const filterSensitive = (data) => {
  const filtered = { ...data };
  delete filtered.clientSecret;
  delete filtered.accessToken;
  return filtered;
};
```
