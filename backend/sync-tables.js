require('dotenv').config();
const { sequelize, Payment, PaymentLog, Product, Order, OrderItem } = require('./src/models');

async function syncTables() {
  console.log('Creating missing tables...\n');

  try {
    // Sync only the missing tables
    console.log('Creating orders table...');
    await Order.sync({ force: false });
    console.log('✓ orders table created\n');

    console.log('Creating order_items table...');
    await OrderItem.sync({ force: false });
    console.log('✓ order_items table created\n');

    console.log('Creating payments table...');
    await Payment.sync({ force: false });
    console.log('✓ payments table created\n');

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
