# PayPal 支付接入项目

个人卖家独立站电商网站 PayPal 支付接入技术文档。

## 项目概述

本项目为电商独立站提供完整的PayPal支付解决方案，采用标准支付模式（跳转PayPal页面完成支付）。

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue.js 3.x |
| 后端 | Node.js + Express |
| 数据库 | MySQL 8.0 |
| 支付 | PayPal REST API |

---

## 文档目录

| 文档 | 说明 |
|------|------|
| [PayPal集成指南](docs/PayPal集成指南.md) | 完整集成指南，包含前置准备、流程说明 |
| [后端API文档](docs/后端API文档.md) | 后端API接口详细说明 |
| [前端集成文档](docs/前端集成文档.md) | 前端Vue组件和页面集成说明 |
| [数据库设计](docs/数据库设计.md) | 数据库表结构和模型定义 |
| [部署配置指南](docs/部署配置指南.md) | 生产环境部署配置说明 |

---

## 快速开始

### 1. PayPal开发者账号

1. 访问 https://developer.paypal.com/
2. 登录并创建沙箱应用
3. 获取 Client ID 和 Client Secret

### 2. 后端配置

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入 PayPal 凭据
npm install
npm run dev
```

### 3. 前端配置

```bash
cd frontend
cp .env.example .env
# 编辑 .env 填入 API 地址和 PayPal Client ID
npm install
npm run dev
```

### 4. 数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE dianshang CHARACTER SET utf8mb4;"

# 执行迁移
cd backend
npx sequelize-cli db:migrate
```

---

## 支付流程

```
用户下单 → 创建订单 → 点击PayPal按钮 → 跳转PayPal授权 
    → 完成支付 → 回调捕获 → 更新订单状态 → 显示结果
```

---

## 项目结构

```
dianshang/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── views/           # 页面
│   │   ├── api/             # API封装
│   │   └── utils/           # 工具函数
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── routes/          # 路由
│   │   ├── services/        # 服务层
│   │   ├── models/          # 数据模型
│   │   └── utils/           # 工具函数
│   └── package.json
│
└── docs/                    # 文档
    ├── PayPal集成指南.md
    ├── 后端API文档.md
    ├── 前端集成文档.md
    ├── 数据库设计.md
    └── 部署配置指南.md
```

---

## 关键接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/orders | 创建订单 |
| POST | /api/payments/create-order | 创建PayPal订单 |
| POST | /api/payments/capture-order | 捕获支付 |
| POST | /api/payments/webhook | PayPal回调 |

---

## 安全要点

1. **Client Secret** 严禁暴露在前端代码中
2. **Webhook签名** 必须验证
3. **订单金额** 后端必须重新计算
4. **HTTPS** 生产环境必须启用

---

## 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

---

## 许可证

MIT
