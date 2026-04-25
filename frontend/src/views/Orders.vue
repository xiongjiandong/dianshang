<template>
  <div class="orders-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-brand" @click="goHome">
        <span class="logo">🛒</span>
        <span class="brand-name">My Store</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/products" class="nav-link">Products</router-link>
      </div>
      <div class="nav-actions">
        <router-link to="/cart" class="cart-link">🛒 Cart</router-link>
      </div>
    </nav>

    <div class="orders-container">
      <h1 class="page-title">My Orders</h1>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet.</p>
        <router-link to="/products" class="shop-btn">Start Shopping</router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">Order #{{ order.orderNo }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div :class="['order-status', order.status]">
              {{ formatStatus(order.status) }}
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">${{ item.price }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              Total: <span class="amount">${{ order.totalAmount }}</span>
            </div>
            <button v-if="order.status === 'pending'" class="pay-btn" @click="payOrder(order.id)">
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import axios from 'axios';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const orders = ref([]);

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3069';

onMounted(async () => {
  userStore.initUser();

  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  await fetchOrders();
});

async function fetchOrders() {
  try {
    loading.value = true;
    const response = await axios.get(`${apiUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });

    if (response.data.success) {
      orders.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatStatus(status) {
  const statusMap = {
    pending: 'Pending',
    paid: 'Paid',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[status] || status;
}

function payOrder(orderId) {
  router.push(`/checkout?orderId=${orderId}`);
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
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

.cart-link {
  color: #666;
  text-decoration: none;
  font-size: 16px;
}

.orders-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 60px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #0070ba;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
}

.shop-btn {
  display: inline-block;
  padding: 12px 30px;
  background: #0070ba;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  font-weight: 600;
  font-size: 16px;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.order-status.pending {
  background: #fff3e0;
  color: #ef6c00;
}

.order-status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-status.shipped {
  background: #e3f2fd;
  color: #1565c0;
}

.order-status.delivered {
  background: #e8f5e9;
  color: #2e7d32;
}

.order-status.cancelled {
  background: #ffebee;
  color: #c62828;
}

.order-items {
  padding: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
}

.item-quantity {
  color: #666;
  margin: 0 20px;
}

.item-price {
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
}

.order-total {
  font-size: 16px;
}

.order-total .amount {
  font-size: 20px;
  font-weight: 600;
  color: #0070ba;
}

.pay-btn {
  padding: 10px 24px;
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.pay-btn:hover {
  background: #005ea6;
}
</style>
