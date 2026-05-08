<template>
  <div class="login-page">
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
    </nav>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome</h1>
          <p>Sign in with Google to continue</p>
        </div>

        <!-- Google Login Button -->
        <button class="google-login-btn" @click="loginWithGoogle">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-footer">
          <p class="terms">
            By signing in, you agree to our
            <router-link to="/privacy" class="link">Privacy Policy</router-link>
            and
            <router-link to="/terms" class="link">Terms of Service</router-link>
          </p>
        </div>
      </div>

      <div class="login-features">
        <div class="feature">
          <span class="feature-icon">🔒</span>
          <span>Secure Authentication</span>
        </div>
        <div class="feature">
          <span class="feature-icon">⚡</span>
          <span>Quick Access</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🛡️</span>
          <span>Data Protection</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const error = ref('');

onMounted(() => {
  if (route.query.error) {
    const errCode = route.query.error;
    const detail = route.query.detail;
    if (detail) {
      error.value = `Authentication failed: ${decodeURIComponent(detail)}`;
    } else if (errCode === 'auth_failed') {
      error.value = 'Authentication failed. Please try again.';
    } else if (errCode === 'google_not_configured') {
      error.value = 'Google login is not configured.';
    } else {
      error.value = `Error: ${errCode}`;
    }
  }
});

function loginWithGoogle() {
  window.location.href = '/api/auth/google';
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
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
  color: white;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: white;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.google-login-btn:hover {
  border-color: #4285F4;
  background: #f8faff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.2);
}

.google-icon {
  width: 24px;
  height: 24px;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  font-size: 14px;
}

.login-footer {
  margin-top: 25px;
}

.login-footer .terms {
  font-size: 12px;
  color: #999;
}

.link {
  color: #667eea;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.login-features {
  display: flex;
  gap: 30px;
  margin-top: 40px;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
}

.feature-icon {
  font-size: 24px;
}

@media (max-width: 500px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-features {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
