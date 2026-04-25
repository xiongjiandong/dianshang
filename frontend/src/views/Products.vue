<template>
  <div class="products-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">🛒</span>
        <span class="brand-name">My Store</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/products" class="nav-link active">Products</router-link>
      </div>
      <div class="nav-actions">
        <router-link to="/login" class="login-btn">
          <span class="login-icon">👤</span>
          <span>Login</span>
        </router-link>
        <div class="nav-cart" @click="goToCart">
          <span class="cart-icon">🛒</span>
          <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
        </div>
      </div>
    </nav>

    <div class="products-container">
      <h1 class="page-title">All Products</h1>

      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image" @click="goToProduct(product.id)">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="product-info">
            <h3 class="product-name" @click="goToProduct(product.id)">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-footer">
              <span class="price">${{ product.price }}</span>
              <button class="add-cart-btn" @click.stop="addToCart(product)">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    description: 'Premium sound quality, comfortable fit, long battery life',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_002',
    name: 'Smart Watch',
    description: 'Health monitoring, fitness tracking, notifications',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_003',
    name: 'Portable Power Bank',
    description: '20000mAh capacity, fast charging support',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_004',
    name: 'Mechanical Keyboard',
    description: 'Tactile switches, RGB backlight, water-resistant',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_005',
    name: 'Wireless Mouse',
    description: 'Silent click, precise tracking, ergonomic design',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_006',
    name: 'USB-C Hub',
    description: 'Type-C interface, multi-port, plug and play',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_007',
    name: 'Tablet Stand',
    description: 'Aluminum alloy, adjustable angle, stable support',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
  },
  {
    id: 'prod_008',
    name: 'Phone Holder',
    description: 'Desktop organizer, foldable design, multi-device',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=300&h=300&fit=crop'
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
.products-page {
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
}

.nav-link:hover,
.nav-link.active {
  color: #0070ba;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #0070ba;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #005ea6;
}

.login-icon {
  font-size: 16px;
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

.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 25px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
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
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  cursor: pointer;
}

.product-name:hover {
  color: #0070ba;
}

.product-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 20px;
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
</style>
