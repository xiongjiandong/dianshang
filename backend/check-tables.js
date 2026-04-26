require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkTables() {
  try {
    // Check existing tables
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Existing tables:', tables.map(t => t.table_name).join(', '));

    // Check payments table structure
    const [paymentsCols] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `);
    console.log('\nPayments table columns:');
    paymentsCols.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkTables();
