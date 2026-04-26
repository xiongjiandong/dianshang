module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Password hash for email/password login'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'google, github, microsoft, local'
    },
    providerId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['provider', 'provider_id'] }
    ]
  });

  return User;
};
