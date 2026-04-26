require('dotenv').config();
const { sequelize } = require('./src/models');

async function fixTables() {
  console.log('Fixing database tables...\n');

  try {
    // Drop and recreate tables with correct structure
    await sequelize.query(`DROP TABLE IF EXISTS payment_logs CASCADE;`);
    await sequelize.query(`DROP TABLE IF EXISTS payments CASCADE;`);
    await sequelize.query(`DROP TABLE IF EXISTS order_items CASCADE;`);
    await sequelize.query(`DROP TABLE IF EXISTS orders CASCADE;`);
    await sequelize.query(`DROP TABLE IF EXISTS products CASCADE;`);
    console.log('✓ Dropped old tables\n');

    // Create orders table
    await sequelize.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(50) NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'pending',
        shipping_address JSON,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ Created orders table');

    // Create order_items table
    await sequelize.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(100),
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ Created order_items table');

    // Create payments table
    await sequelize.query(`
      CREATE TABLE payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        paypal_order_id VARCHAR(100) UNIQUE,
        paypal_transaction_id VARCHAR(100),
        paypal_payer_id VARCHAR(100),
        payer_email VARCHAR(255),
        payer_name VARCHAR(255),
        payer_country VARCHAR(3),
        payment_method VARCHAR(20) DEFAULT 'paypal',
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'pending',
        error_code VARCHAR(50),
        error_message TEXT,
        webhook_event_id VARCHAR(100),
        webhook_received_at TIMESTAMP WITH TIME ZONE,
        captured_at TIMESTAMP WITH TIME ZONE,
        refunded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✓ Created payments table');

    // Create payment_logs table
    await sequelize.query(`
      CREATE TABLE payment_logs (
        id BIGSERIAL PRIMARY KEY,
        payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        request_data JSON,
        response_data JSON,
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        execution_time INTEGER,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      COMMENT ON COLUMN payment_logs.action IS '操作类型: create_order, capture, webhook, refund等';
      COMMENT ON COLUMN payment_logs.execution_time IS '执行时间(ms)';
    `);
    console.log('✓ Created payment_logs table');

    // Create products table
    await sequelize.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        stock INTEGER DEFAULT 0,
        image VARCHAR(500),
        status SMALLINT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      COMMENT ON COLUMN products.status IS '0-下架 1-上架';
    `);
    console.log('✓ Created products table');

    // Insert sample products
    await sequelize.query(`
      INSERT INTO products (name, description, price, currency, stock, image, status) VALUES
      ('Wireless Bluetooth Earbuds', 'Premium sound quality, comfortable fit', 14.99, 'USD', 100, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop', 1),
      ('Smart Watch', 'Health monitoring, fitness tracking', 49.99, 'USD', 50, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop', 1),
      ('Portable Power Bank', 'High capacity, fast charging support', 9.99, 'USD', 200, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&h=300&fit=crop', 1),
      ('Mechanical Keyboard', 'Tactile feedback, RGB backlight', 29.99, 'USD', 80, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop', 1),
      ('Wireless Mouse', 'Silent click, precise tracking', 12.49, 'USD', 150, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop', 1),
      ('USB-C Hub', 'Multiple ports, plug and play', 17.99, 'USD', 120, 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=300&h=300&fit=crop', 1);
    `);
    console.log('✓ Inserted sample products\n');

    console.log('========================================');
    console.log('✓ All tables fixed successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixTables();
