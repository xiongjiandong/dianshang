import axios from 'axios';

// 生产环境直接使用后端URL，开发环境使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dianshang-o71u.vercel.app';

console.log('API Base URL:', API_BASE_URL);

const request = axios.create({
  baseURL: API_BASE_URL + '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response.data;
  },
  error => {
    console.error('API Error:', error.message);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default request;
