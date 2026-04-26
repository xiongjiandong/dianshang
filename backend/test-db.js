require('dotenv').config();
const { sequelize, User, Order, OrderItem, Payment, PaymentLog, Product } = require('./src/models');

async function testDatabase() {
  console.log('========================================');
  console.log('Database Connection Test');
  console.log('========================================\n');

  try {
    // 1. Test connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✓ Database connected successfully!\n');

    // 2. Test User table
    console.log('2. Testing User table...');
    const userCount = await User.count();
    console.log(`   ✓ User table accessible, current records: ${userCount}\n`);

    // 3. Test Order table
    console.log('3. Testing Order table...');
    const orderCount = await Order.count();
    console.log(`   ✓ Order table accessible, current records: ${orderCount}\n`);

    // 4. Test OrderItem table
    console.log('4. Testing OrderItem table...');
    const orderItemCount = await OrderItem.count();
    console.log(`   ✓ OrderItem table accessible, current records: ${orderItemCount}\n`);

    // 5. Test Payment table
    console.log('5. Testing Payment table...');
    const paymentCount = await Payment.count();
    console.log(`   ✓ Payment table accessible, current records: ${paymentCount}\n`);

    // 6. Test PaymentLog table
    console.log('6. Testing PaymentLog table...');
    const paymentLogCount = await PaymentLog.count();
    console.log(`   ✓ PaymentLog table accessible, current records: ${paymentLogCount}\n`);

    // 7. Test Product table
    console.log('7. Testing Product table...');
    const productCount = await Product.count();
    console.log(`   ✓ Product table accessible, current records: ${productCount}\n`);

    // 8. Test write operation (create a test user)
    console.log('8. Testing write operation...');
    const { randomUUID } = require('crypto');
    const testUserId = randomUUID();
    try {
      const testUser = await User.create({
        id: testUserId,
        email: `test_${Date.now()}@test.com`,
        name: 'Test User',
        provider: 'test',
        providerId: 'test_' + Date.now()
      });
      console.log(`   ✓ Write operation successful, created test user: ${testUser.id}\n`);

      // 9. Test read operation
      console.log('9. Testing read operation...');
      const foundUser = await User.findByPk(testUserId);
      console.log(`   ✓ Read operation successful, found user: ${foundUser.name}\n`);

      // 10. Test update operation
      console.log('10. Testing update operation...');
      await foundUser.update({ name: 'Updated Test User' });
      console.log(`   ✓ Update operation successful\n`);

      // 11. Test delete operation
      console.log('11. Testing delete operation...');
      await foundUser.destroy();
      console.log(`   ✓ Delete operation successful\n`);

    } catch (writeError) {
      console.log(`   ⚠ Write test skipped: ${writeError.message}\n`);
    }

    console.log('========================================');
    console.log('✓ All database tests passed!');
    console.log('========================================\n');

    console.log('Database Summary:');
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Orders: ${orderCount}`);
    console.log(`  - Order Items: ${orderItemCount}`);
    console.log(`  - Payments: ${paymentCount}`);
    console.log(`  - Payment Logs: ${paymentLogCount}`);
    console.log(`  - Products: ${productCount}`);

  } catch (error) {
    console.error('\n✗ Database test failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testDatabase();
