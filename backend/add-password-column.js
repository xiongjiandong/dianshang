require('dotenv').config();
const { sequelize } = require('./src/models');

async function addPasswordColumn() {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);');
    console.log('✓ Password column added successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addPasswordColumn();
