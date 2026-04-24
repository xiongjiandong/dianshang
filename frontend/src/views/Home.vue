<template>
  <div class="home-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">🛒</span>
        <span class="brand-name">My Store</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link active">Home</router-link>
        <router-link to="/products" class="nav-link">Products</router-link>
      </div>
      <div class="nav-cart" @click="goToCart">
        <span class="cart-icon">🛒</span>
        <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
      </div>
    </nav>

    <!-- Banner -->
    <section class="hero-banner">
      <div class="hero-content">
        <h1>Premium Quality Products</h1>
        <p>Secure payment with PayPal</p>
        <router-link to="/products" class="shop-btn">Shop Now</router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="products-section">
      <h2 class="section-title">Featured Products</h2>
      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image" @click="goToProduct(product.id)">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="product-info">
            <h3 class="product-name" @click="goToProduct(product.id)">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-price">
              <span class="price">${{ product.price }}</span>
              <button class="add-cart-btn" @click.stop="addToCart(product)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Secure Payment</h3>
        <p>Protected by PayPal</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🚚</div>
        <h3>Fast Shipping</h3>
        <p>Worldwide delivery</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💬</div>
        <h3>24/7 Support</h3>
        <p>Always here to help</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2024 My Store. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cartStore = useCartStore();

const cartItemCount = computed(() => cartStore.itemCount);

const products = ref([
  {
    id: 'prod_001',
    name: 'Wireless Bluetooth Earbuds',
    description: 'Premium sound quality, comfortable fit',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_002',
    name: 'Smart Watch',
    description: 'Health monitoring, fitness tracking',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_003',
    name: 'Portable Power Bank',
    description: 'High capacity, fast charging support',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_004',
    name: 'Mechanical Keyboard',
    description: 'Tactile feedback, RGB backlight',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_005',
    name: 'Wireless Mouse',
    description: 'Silent click, precise tracking',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_006',
    name: 'USB-C Hub',
    description: 'Multiple ports, plug and play',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=300&h=300&fit=crop'
  }
]);

function addToCart(product) {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1
  });
  alert(`${product.name} added to cart!`);
}

function goToCart() {
  router.push('/cart');
}

function goToProduct(productId) {
  router.push(`/product/${productId}`);
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 28px;
}

.brand-name {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #0070ba;
}

.nav-cart {
  position: relative;
  cursor: pointer;
  font-size: 24px;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 40px;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.shop-btn {
  display: inline-block;
  padding: 14px 40px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.3s;
}

.shop-btn:hover {
  transform: scale(1.05);
}

.products-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 40px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-image:hover img {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
  cursor: pointer;
}

.product-name:hover {
  color: #0070ba;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 22px;
  font-weight: 600;
  color: #0070ba;
}

.add-cart-btn {
  padding: 8px 16px;
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.add-cart-btn:hover {
  background: #005ea6;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding: 60px 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #333;
}

.feature-card p {
  font-size: 14px;
  color: #666;
}

.footer {
  text-align: center;
  padding: 30px;
  background: #333;
  color: #999;
}

@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
  }

  .hero-banner {
    padding: 50px 20px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .products-section {
    padding: 40px 20px;
  }

  .features {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }
}
</style>
