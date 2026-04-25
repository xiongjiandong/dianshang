<template>
  <div class="product-detail-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo">🛒</span>
        <span class="brand-name">My Store</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/products" class="nav-link">Products</router-link>
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

    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <router-link to="/">Home</router-link>
      <span class="separator">/</span>
      <router-link to="/products">Products</router-link>
      <span class="separator">/</span>
      <span class="current">{{ product.name }}</span>
    </div>

    <!-- Product Detail -->
    <div class="product-container" v-if="product">
      <div class="product-gallery">
        <div class="main-image">
          <img :src="product.image" :alt="product.name" />
        </div>
      </div>

      <div class="product-info">
        <h1 class="product-title">{{ product.name }}</h1>
        <p class="product-desc">{{ product.description }}</p>

        <div class="product-price-section">
          <span class="price-label">Price:</span>
          <span class="price-value">${{ product.price }}</span>
        </div>

        <div class="product-features">
          <h3>Product Features</h3>
          <ul>
            <li v-for="(feature, index) in productFeatures" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="quantity-section">
          <label>Quantity:</label>
          <div class="quantity-control">
            <button @click="decreaseQty" class="qty-btn">-</button>
            <span class="qty-value">{{ quantity }}</span>
            <button @click="increaseQty" class="qty-btn">+</button>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-add-cart" @click="addToCart">
            Add to Cart
          </button>
          <button class="btn-buy-now" @click="buyNow">
            Buy Now
          </button>
        </div>

        <div class="product-meta">
          <div class="meta-item">
            <span class="meta-icon">📦</span>
            <span>Free Shipping</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">↩️</span>
            <span>30-Day Returns</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div class="related-products">
      <h2>You May Also Like</h2>
      <div class="products-grid">
        <div v-for="item in relatedProducts" :key="item.id" class="product-card" @click="goToProduct(item.id)">
          <div class="card-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="card-info">
            <h4>{{ item.name }}</h4>
            <p class="card-price">${{ item.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const quantity = ref(1);

const cartItemCount = computed(() => cartStore.itemCount);

const products = [
  {
    id: 'prod_001',
    name: 'Wireless Bluetooth Earbuds',
    description: 'Premium sound quality with comfortable fit. Features active noise cancellation and long battery life up to 24 hours.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_002',
    name: 'Smart Watch',
    description: 'Health monitoring with fitness tracking. Features heart rate monitor, sleep tracker, and smartphone notifications.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_003',
    name: 'Portable Power Bank',
    description: '20000mAh high capacity with fast charging support. Compatible with all USB devices.',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_004',
    name: 'Mechanical Keyboard',
    description: 'Tactile switches with RGB backlight. Water-resistant design with programmable keys.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_005',
    name: 'Wireless Mouse',
    description: 'Silent click with precise tracking. Ergonomic design for comfortable long-time use.',
    price: 12.49,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_006',
    name: 'USB-C Hub',
    description: 'Type-C interface with multiple ports. Plug and play, compatible with all devices.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1606765962248-7ff407b51667?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_007',
    name: 'Tablet Stand',
    description: 'Aluminum alloy construction with adjustable angle. Stable support for all tablet sizes.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'
  },
  {
    id: 'prod_008',
    name: 'Phone Holder',
    description: 'Desktop organizer with foldable design. Compatible with all smartphone sizes.',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=500&h=500&fit=crop'
  }
];

const productFeatures = {
  'prod_001': [
    'Active Noise Cancellation',
    '24-hour battery life',
    'Bluetooth 5.0 connectivity',
    'Water-resistant design',
    'Touch control'
  ],
  'prod_002': [
    'Heart rate monitoring',
    'Sleep tracking',
    'Fitness tracking',
    'Smart notifications',
    '7-day battery life'
  ],
  'prod_003': [
    '20000mAh capacity',
    'Fast charging support',
    'Dual USB output',
    'LED indicator',
    'Compact design'
  ],
  'prod_004': [
    'Mechanical switches',
    'RGB backlight',
    'Water-resistant',
    'Programmable keys',
    'Detachable cable'
  ],
  'prod_005': [
    'Silent click technology',
    '2.4GHz wireless',
    'Ergonomic design',
    'Long battery life',
    'Precise tracking'
  ],
  'prod_006': [
    '4K HDMI output',
    'USB 3.0 ports',
    'SD card reader',
    'Plug and play',
    'Compact design'
  ],
  'prod_007': [
    'Aluminum alloy',
    'Adjustable angle',
    'Non-slip base',
    'Foldable design',
    'Universal compatibility'
  ],
  'prod_008': [
    'Foldable design',
    'Adjustable width',
    'Non-slip surface',
    'Universal fit',
    'Portable size'
  ]
};

const product = computed(() => {
  return products.find(p => p.id === route.params.id) || products[0];
});

const relatedProducts = computed(() => {
  return products.filter(p => p.id !== route.params.id).slice(0, 4);
});

watch(() => route.params.id, () => {
  quantity.value = 1;
  window.scrollTo(0, 0);
});

onMounted(() => {
  window.scrollTo(0, 0);
});

function increaseQty() {
  quantity.value++;
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function addToCart() {
  cartStore.addItem({
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    quantity: quantity.value
  });
  alert(`${product.value.name} added to cart!`);
}

function buyNow() {
  addToCart();
  router.push('/cart');
}

function goToCart() {
  router.push('/cart');
}

function goToProduct(productId) {
  router.push(`/product/${productId}`);
}
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Navbar */
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

.nav-link:hover {
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

/* Breadcrumb */
.breadcrumb {
  padding: 15px 40px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #0070ba;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: #ccc;
}

.current {
  color: #333;
}

/* Product Container */
.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 40px;
  background: white;
}

@media (max-width: 900px) {
  .product-container {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}

/* Gallery */
.product-gallery {
  padding: 20px;
}

.main-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.main-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Product Info */
.product-info {
  padding: 20px;
}

.product-title {
  font-size: 28px;
  margin-bottom: 15px;
  color: #333;
}

.product-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
}

.product-price-section {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.price-label {
  font-size: 16px;
  color: #666;
}

.price-value {
  font-size: 32px;
  font-weight: 600;
  color: #0070ba;
}

.product-features {
  margin-bottom: 25px;
}

.product-features h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.product-features ul {
  list-style: none;
  padding: 0;
}

.product-features li {
  padding: 8px 0;
  color: #555;
  position: relative;
  padding-left: 20px;
}

.product-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4caf50;
  font-weight: bold;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.quantity-section label {
  font-size: 16px;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.3s;
}

.qty-btn:hover {
  background: #e0e0e0;
}

.qty-value {
  width: 50px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-add-cart,
.btn-buy-now {
  flex: 1;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-cart {
  background: white;
  color: #0070ba;
  border: 2px solid #0070ba;
}

.btn-add-cart:hover {
  background: #f0f7ff;
}

.btn-buy-now {
  background: #0070ba;
  color: white;
  border: none;
}

.btn-buy-now:hover {
  background: #005ea6;
}

.product-meta {
  display: flex;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.meta-icon {
  font-size: 18px;
}

/* Related Products */
.related-products {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.related-products h2 {
  font-size: 24px;
  margin-bottom: 25px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.card-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 15px;
}

.card-info h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-price {
  color: #0070ba;
  font-weight: 600;
  font-size: 16px;
}
</style>
