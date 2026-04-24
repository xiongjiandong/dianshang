const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'order_no'
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      comment: '用户ID，游客下单可为空'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'shipping_fee'
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ),
      defaultValue: 'pending'
    },
    recipientName: {
      type: DataTypes.STRING(100),
      field: 'recipient_name'
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING(100)
    },
    state: {
      type: DataTypes.STRING(100)
    },
    postalCode: {
      type: DataTypes.STRING(20),
      field: 'postal_code'
    },
    country: {
      type: DataTypes.STRING(3)
    },
    notes: {
      type: DataTypes.TEXT
    },
    paidAt: {
      type: DataTypes.DATE,
      field: 'paid_at'
    },
    shippedAt: {
      type: DataTypes.DATE,
      field: 'shipped_at'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      field: 'delivered_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
    Order.hasMany(models.Payment, {
      foreignKey: 'orderId',
      as: 'payments'
    });
  };

  return Order;
};
