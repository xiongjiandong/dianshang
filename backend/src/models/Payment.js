const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id'
    },
    paypalOrderId: {
      type: DataTypes.STRING(100),
      unique: true,
      field: 'paypal_order_id'
    },
    paypalTransactionId: {
      type: DataTypes.STRING(100),
      field: 'paypal_transaction_id'
    },
    paypalPayerId: {
      type: DataTypes.STRING(100),
      field: 'paypal_payer_id'
    },
    payerEmail: {
      type: DataTypes.STRING(255),
      field: 'payer_email'
    },
    payerName: {
      type: DataTypes.STRING(255),
      field: 'payer_name'
    },
    payerCountry: {
      type: DataTypes.STRING(3),
      field: 'payer_country'
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      defaultValue: 'paypal',
      field: 'payment_method'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'authorized',
        'captured',
        'completed',
        'failed',
        'refunded',
        'partially_refunded'
      ),
      defaultValue: 'pending'
    },
    errorCode: {
      type: DataTypes.STRING(50),
      field: 'error_code'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      field: 'error_message'
    },
    webhookEventId: {
      type: DataTypes.STRING(100),
      field: 'webhook_event_id'
    },
    webhookReceivedAt: {
      type: DataTypes.DATE,
      field: 'webhook_received_at'
    },
    capturedAt: {
      type: DataTypes.DATE,
      field: 'captured_at'
    },
    refundedAt: {
      type: DataTypes.DATE,
      field: 'refunded_at'
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });
    Payment.hasMany(models.PaymentLog, {
      foreignKey: 'paymentId',
      as: 'logs'
    });
  };

  return Payment;
};
