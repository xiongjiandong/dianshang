<template>
  <div class="profile-page">
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

    <div class="profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img v-if="userStore.userAvatar" :src="userStore.userAvatar" class="avatar" />
            <div v-else class="avatar-placeholder">{{ userStore.userName.charAt(0).toUpperCase() }}</div>
            <h2>{{ userStore.userName }}</h2>
            <p class="email">{{ userStore.userEmail }}</p>
          </div>
        </div>

        <div class="profile-menu">
          <router-link to="/orders" class="menu-item">
            <span class="menu-icon">📦</span>
            <span class="menu-text">My Orders</span>
            <span class="menu-arrow">→</span>
          </router-link>

          <router-link to="/cart" class="menu-item">
            <span class="menu-icon">🛒</span>
            <span class="menu-text">Shopping Cart</span>
            <span class="menu-arrow">→</span>
          </router-link>

          <div class="menu-item" @click="handleLogout">
            <span class="menu-icon">🚪</span>
            <span class="menu-text logout-text">Logout</span>
            <span class="menu-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  userStore.initUser();
  if (!userStore.isLoggedIn) {
    router.push('/login');
  }
});

function goHome() {
  router.push('/');
}

function handleLogout() {
  userStore.logout();
  router.push('/');
}
</script>

<style scoped>
.profile-page {
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

.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  text-align: center;
  color: white;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
}

.profile-header h2 {
  margin: 0;
  font-size: 24px;
}

.email {
  opacity: 0.9;
  font-size: 14px;
}

.profile-menu {
  padding: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  color: #333;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-icon {
  font-size: 24px;
  margin-right: 15px;
}

.menu-text {
  flex: 1;
  font-size: 16px;
}

.logout-text {
  color: #ff4757;
}

.menu-arrow {
  color: #999;
  font-size: 18px;
}
</style>
