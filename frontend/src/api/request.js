import axios from 'axios';

// 生产环境直接使用后端URL，开发环境使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dianshang-o71u.vercel.app';

const request = axios.create({
  baseURL: API_BASE_URL + '/api',
  timeout: 30000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const message = error.response?.data?.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default request;
