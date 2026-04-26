require('dotenv').config();
const { sequelize, PaymentLog, Product } = require('./src/models');

async function syncTables() {
  console.log('Creating missing tables...\n');

  try {
    // Sync only the missing tables
    console.log('Creating payment_logs table...');
    await PaymentLog.sync({ force: false });
    console.log('✓ payment_logs table created\n');

    console.log('Creating products table...');
    await Product.sync({ force: false });
    console.log('✓ products table created\n');

    console.log('All tables synced successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

syncTables();
