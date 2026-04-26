<template>
  <div class="register-page">
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

    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Create Account</h1>
          <p>Join us and start shopping</p>
        </div>

        <!-- Registration Form -->
        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text"
              id="name"
              v-model="registerForm.name"
              placeholder="Enter your name"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="registerForm.email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="registerForm.password"
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <div class="register-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="link">Sign in</router-link>
          </p>
          <p class="terms">
            By creating an account, you agree to our
            <router-link to="/privacy" class="link">Privacy Policy</router-link>
            and
            <router-link to="/terms" class="link">Terms of Service</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import axios from 'axios';

const router = useRouter();
const userStore = useUserStore();
const error = ref('');
const success = ref('');
const loading = ref(false);

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

async function handleRegister() {
  error.value = '';
  success.value = '';

  if (!registerForm.value.email || !registerForm.value.password) {
    error.value = 'Please fill in all required fields';
    return;
  }

  if (registerForm.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post('/api/auth/register', {
      email: registerForm.value.email,
      password: registerForm.value.password,
      name: registerForm.value.name
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      userStore.login(token, user);
      success.value = 'Account created successfully! Redirecting...';
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.register-page {
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

.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
  font-size: 16px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.success-message {
  margin-top: 20px;
  padding: 12px;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  color: #2e7d32;
  text-align: center;
  font-size: 14px;
}

.register-footer {
  margin-top: 25px;
  text-align: center;
}

.register-footer p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.register-footer .terms {
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

@media (max-width: 500px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }
}
</style>
