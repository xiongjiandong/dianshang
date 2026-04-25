import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const token = ref(null);

  // 初始化时从localStorage读取
  const initUser = () => {
    try {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        token.value = savedToken;
        user.value = JSON.parse(decodeURIComponent(savedUser));
      }
    } catch (error) {
      console.error('Failed to init user:', error);
      logout();
    }
  };

  // 登录
  const login = (newToken, newUser) => {
    token.value = newToken;
    user.value = newUser;

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user', encodeURIComponent(JSON.stringify(newUser)));
  };

  // 登出
  const logout = () => {
    user.value = null;
    token.value = null;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  // 是否已登录
  const isLoggedIn = computed(() => !!user.value && !!token.value);

  // 用户信息
  const userName = computed(() => user.value?.name || 'Guest');
  const userEmail = computed(() => user.value?.email || '');
  const userAvatar = computed(() => user.value?.avatar || '');

  return {
    user,
    token,
    initUser,
    login,
    logout,
    isLoggedIn,
    userName,
    userEmail,
    userAvatar
  };
});
