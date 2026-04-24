# PayPal 支付集成指南

## 一、概述

本文档描述个人卖家独立站电商网站接入PayPal支付的完整技术方案。

### 1.1 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue.js 3.x |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 支付 | PayPal REST API |

### 1.2 支付模式

采用 **PayPal Standard Payment**（标准支付）模式：
- 用户点击支付按钮后跳转到PayPal页面
- 用户在PayPal完成登录和授权
- 支付完成后跳转回网站

---

## 二、前置准备

### 2.1 注册PayPal开发者账号

1. 访问 [PayPal开发者平台](https://developer.paypal.com/)
2. 使用PayPal账号登录或注册新账号
3. 进入 Dashboard -> My Apps & Credentials

### 2.2 创建沙箱应用

1. 切换到 **Sandbox** 标签
2. 点击 **Create App** 创建新应用
3. 输入应用名称，选择默认商家账号
4. 创建后获取：
   - Client ID（客户端ID）
   - Client Secret（客户端密钥）

### 2.3 创建测试账号

在 Dashboard -> Sandbox -> Accounts 中：
- 系统默认创建商家账号和个人买家账号
- 可创建更多测试账号模拟不同场景
- 测试账号可用于模拟登录和支付

### 2.4 配置Webhook

1. 进入 Dashboard -> My Apps & Credentials -> 选择应用
2. 点击 **Add Webhook**
3. 输入Webhook URL：`https://yourdomain.com/api/payments/webhook`
4. 选择订阅事件类型：
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. 保存后获取 **Webhook ID**

---

## 三、支付流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户      │     │   商家后端   │     │   PayPal    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │  1. 创建订单       │                    │
       │───────────────────>│                    │
       │                    │                    │
       │  2. 返回订单ID     │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  3. 点击PayPal按钮 │                    │
       │───────────────────>│                    │
       │                    │  4. 创建PayPal订单 │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  5. 返回订单ID和URL│
       │                    │<───────────────────│
       │                    │                    │
       │  6. 跳转PayPal页面 │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  7. 用户授权支付   │                    │
       │────────────────────────────────────────>│
       │                    │                    │
       │  8. 支付完成回调   │                    │
       │<────────────────────────────────────────│
       │                    │                    │
       │  9. 捕获支付       │                    │
       │───────────────────>│                    │
       │                    │  10. 确认支付      │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  11. 支付成功      │
       │                    │<───────────────────│
       │                    │                    │
       │  12. 显示结果      │                    │
       │<───────────────────│                    │
       │                    │                    │
       │                    │  13. Webhook通知   │
       │                    │<───────────────────│
       │                    │                    │
```

---

## 四、项目结构

```
dianshang/
├── frontend/                          # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── payment/
│   │   │       ├── PayPalButton.vue   # PayPal按钮组件
│   │   │       └── PaymentStatus.vue  # 支付状态组件
│   │   ├── views/
│   │   │   ├── Checkout.vue           # 结账页面
│   │   │   └── PaymentResult.vue      # 支付结果页
│   │   ├── api/
│   │   │   └── payment.js             # 支付API
│   │   ├── utils/
│   │   │   └── paypal-sdk.js          # SDK加载工具
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js
│   │   │   └── paypal.js              # PayPal配置
│   │   ├── controllers/
│   │   │   ├── orderController.js
│   │   │   └── paymentController.js   # 支付控制器
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   └── paymentRoutes.js       # 支付路由
│   │   ├── services/
│   │   │   ├── paypalService.js       # PayPal服务
│   │   │   └── orderService.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── Order.js               # 订单模型
│   │   │   └── Payment.js             # 支付记录模型
│   │   ├── middlewares/
│   │   │   └── webhookVerify.js       # Webhook验证
│   │   ├── utils/
│   │   │   ├── paypalClient.js        # PayPal客户端
│   │   │   └── logger.js
│   │   └── app.js
│   ├── package.json
│   └── .env.example
│
├── docs/                              # 文档目录
│   ├── PayPal集成指南.md
│   ├── 后端API文档.md
│   ├── 前端集成文档.md
│   ├── 数据库设计.md
│   └── 部署配置指南.md
│
└── README.md
```

---

## 五、环境变量配置

### 5.1 后端环境变量

创建 `backend/.env` 文件：

```bash
# 应用配置
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dianshang
DB_USER=root
DB_PASSWORD=your_password

# PayPal沙箱配置
PAYPAL_SANDBOX_CLIENT_ID=AZDxjDScFp...your_sandbox_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=EGnHDxD_...your_sandbox_secret
PAYPAL_WEBHOOK_ID=1234567890abcdef...your_webhook_id

# PayPal生产配置（上线时使用）
PAYPAL_PRODUCTION_CLIENT_ID=your_production_client_id
PAYPAL_PRODUCTION_CLIENT_SECRET=your_production_secret
PAYPAL_PRODUCTION_WEBHOOK_ID=your_production_webhook_id

# 安全配置
JWT_SECRET=your_jwt_secret_at_least_32_characters
CORS_ORIGIN=http://localhost:5173

# 前端配置
FRONTEND_URL=http://localhost:5173
SITE_NAME=My Store
```

### 5.2 前端环境变量

创建 `frontend/.env` 文件：

```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:3000

# PayPal沙箱Client ID（可公开）
VITE_PAYPAL_CLIENT_ID=AZDxjDScFp...your_sandbox_client_id
```

---

## 六、依赖安装

### 6.1 后端依赖

```bash
cd backend
npm init -y
npm install express cors helmet dotenv morgan
npm install sequelize mysql2
npm install axios uuid
npm install --save-dev nodemon
```

### 6.2 前端依赖

```bash
cd frontend
npm create vite@latest . -- --template vue
npm install axios pinia vue-router
npm install element-plus  # UI组件库（可选）
```

---

## 七、安全性要点

### 7.1 密钥安全

| 密钥类型 | 存储位置 | 是否可公开 |
|----------|----------|------------|
| Client ID | 前端 + 后端 | ✅ 可公开 |
| Client Secret | 仅后端 | ❌ 严禁公开 |
| Webhook ID | 仅后端 | ❌ 严禁公开 |

### 7.2 安全检查清单

- [ ] Client Secret 从未提交到Git仓库
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 生产环境强制HTTPS
- [ ] 验证所有Webhook请求签名
- [ ] 后端重新计算并验证订单金额
- [ ] 实现幂等性处理防止重复支付
- [ ] 对支付API实施速率限制

---

## 八、测试流程

### 8.1 沙箱测试步骤

1. 启动后端服务
2. 启动前端服务
3. 添加商品到购物车
4. 进入结账页面填写信息
5. 点击PayPal支付按钮
6. 使用沙箱买家账号登录PayPal
7. 确认支付
8. 验证支付结果页面

### 8.2 沙箱测试账号

在 PayPal开发者平台 -> Sandbox -> Accounts 获取：
- 买家账号邮箱格式：`xxx@personal.example.com`
- 商家账号邮箱格式：`xxx@business.example.com`
- 点击账号可查看/修改密码

### 8.3 Webhook测试

使用 PayPal Webhook模拟器：
1. 进入 Dashboard -> Sandbox -> Webhooks
2. 选择已配置的Webhook
3. 点击 **Simulate Webhook**
4. 选择事件类型并发送模拟请求

---

## 九、上线清单

### 9.1 PayPal配置

- [ ] 创建生产环境应用
- [ ] 获取生产Client ID和Secret
- [ ] 配置生产Webhook URL
- [ ] 记录生产Webhook ID

### 9.2 代码配置

- [ ] 更新生产环境变量
- [ ] 确认API URL指向生产环境
- [ ] 配置CORS允许生产域名
- [ ] 启用HTTPS

### 9.3 测试验证

- [ ] 生产环境小额真实支付测试
- [ ] Webhook接收测试
- [ ] 支付状态同步测试
- [ ] 退款流程测试（如支持）

---

## 十、相关文档

- [后端API文档](./后端API文档.md)
- [前端集成文档](./前端集成文档.md)
- [数据库设计](./数据库设计.md)
- [部署配置指南](./部署配置指南.md)
