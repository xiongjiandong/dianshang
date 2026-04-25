<template>
  <div class="auth-callback-page">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Logging in...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

onMounted(() => {
  const { token, user } = route.query;

  if (token && user) {
    try {
      // 保存token到localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', user);

      // 解析用户信息
      const userData = JSON.parse(decodeURIComponent(user));
      console.log('Login successful:', userData);

      // 重定向到首页
      router.replace('/');
    } catch (error) {
      console.error('Auth callback error:', error);
      router.replace('/login?error=auth_failed');
    }
  } else {
    router.replace('/login?error=no_token');
  }
});
</script>

<style scoped>
.auth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 18px;
}
</style>
