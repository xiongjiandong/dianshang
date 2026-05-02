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
          <h1>Welcome Back</h1>
          <p>Sign in to continue shopping</p>
        </div>

        <!-- Email/Password Login Form -->
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="login-divider">
          <span>or continue with</span>
        </div>

        <div class="social-buttons">
          <!-- Google -->
          <button class="social-btn google-btn" @click="loginWithGoogle">
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>

        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="link">Create one</router-link>
          </p>
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
import { useUserStore } from '@/stores/user';
import { login as loginApi } from '@/api/auth';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const error = ref('');
const loading = ref(false);

const loginForm = ref({
  email: '',
  password: ''
});

onMounted(() => {
  if (route.query.error) {
    error.value = 'Authentication failed. Please try again.';
  }
});

async function handleLogin() {
  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Please enter email and password';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await loginApi({
      email: loginForm.value.email,
      password: loginForm.value.password
    });

    if (response.success) {
      const { token, user } = response.data;
      userStore.login(token, user);
      router.push('/');
    }
  } catch (err) {
    console.error('Login error:', err);
    if (err.response) {
      error.value = err.response.data?.message || `Error: ${err.response.status}`;
    } else if (err.request) {
      error.value = 'Cannot connect to server. Please check if server is running.';
    } else {
      error.value = err.message || 'Login failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}

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
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.login-divider span {
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 50px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 22px;
  height: 22px;
}

.google-btn:hover {
  border-color: #4285F4;
  background: #f8faff;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  text-align: center;
  font-size: 14px;
}

.login-footer {
  margin-top: 25px;
  text-align: center;
}

.login-footer p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.login-footer .terms {
  font-size: 12px;
  color: #999;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
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

  .login-header h1 {
    font-size: 24px;
  }

  .social-buttons {
    gap: 8px;
  }

  .social-btn {
    width: 70px;
  }

  .login-features {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
