<template>
  <div class="cart-page">
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
    </nav>

    <div class="cart-container">
      <h1 class="page-title">Shopping Cart</h1>

      <!-- Empty Cart -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <router-link to="/products" class="continue-btn">Continue Shopping</router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-price">${{ item.price }}</p>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item)" class="qty-btn">-</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" class="qty-btn">+</button>
            </div>
            <div class="item-total">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </div>
            <button @click="removeItem(item.id)" class="remove-btn">✕</button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Items</span>
            <span>{{ cartItemCount }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span class="total-amount">${{ totalAmount.toFixed(2) }}</span>
          </div>
          <button @click="goToCheckout" class="checkout-btn">
            Proceed to Checkout
          </button>
          <router-link to="/products" class="continue-link">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cartStore = useCartStore();

const cartItems = computed(() => cartStore.items);
const cartItemCount = computed(() => cartStore.itemCount);
const totalAmount = computed(() => cartStore.totalAmount);

function increaseQuantity(item) {
  cartStore.updateQuantity(item.id, item.quantity + 1);
}

function decreaseQuantity(item) {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1);
  }
}

function removeItem(productId) {
  cartStore.removeItem(productId);
}

function goToCheckout() {
  router.push('/checkout');
}
</script>

<style scoped>
.cart-page {
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

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-cart p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.continue-btn {
  display: inline-block;
  padding: 12px 40px;
  background: #0070ba;
  color: white;
  text-decoration: none;
  border-radius: 25px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

@media (max-width: 900px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  gap: 20px;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.item-price {
  color: #0070ba;
  font-weight: 500;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.qty-btn:hover {
  background: #f5f5f5;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.item-total {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 25px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.cart-summary h2 {
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #666;
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-amount {
  color: #0070ba;
  font-size: 24px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;
}

.checkout-btn:hover {
  background: #005ea6;
}

.continue-link {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #0070ba;
  text-decoration: none;
}
</style>
