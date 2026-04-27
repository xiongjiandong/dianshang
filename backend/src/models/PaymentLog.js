const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PaymentLog = sequelize.define('PaymentLog', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    paymentId: {
      type: DataTypes.STRING(100),
      field: 'payment_id'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作类型: create_order, capture, webhook, refund等'
    },
    requestData: {
      type: DataTypes.JSON,
      field: 'request_data'
    },
    responseData: {
      type: DataTypes.JSON,
      field: 'response_data'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.STRING(500),
      field: 'user_agent'
    },
    executionTime: {
      type: DataTypes.INTEGER,
      field: 'execution_time',
      comment: '执行时间(ms)'
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      field: 'error_message'
    }
  }, {
    tableName: 'payment_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // 不再建立关联，因为 payment_id 存储的是 PayPal 订单号（字符串）

  return PaymentLog;
};
