<template>
  <div class="payment-status">
    <div :class="['status-icon', statusClass]">
      <span v-if="status === 'success'" class="icon">✓</span>
      <span v-else-if="status === 'failed'" class="icon">✗</span>
      <span v-else-if="status === 'cancelled'" class="icon">!</span>
      <span v-else class="icon">?</span>
    </div>

    <h2 class="status-title">{{ statusTitle }}</h2>
    <p v-if="message" class="status-message">{{ message }}</p>

    <div v-if="orderInfo" class="order-info">
      <div class="info-item">
        <span class="label">Order #:</span>
        <span class="value">{{ orderInfo.orderNo }}</span>
      </div>
      <div class="info-item">
        <span class="label">Amount:</span>
        <span class="value">{{ formatAmount(orderInfo.amount) }} {{ orderInfo.currency }}</span>
      </div>
      <div v-if="orderInfo.transactionId" class="info-item">
        <span class="label">Transaction #:</span>
        <span class="value">{{ orderInfo.transactionId }}</span>
      </div>
    </div>

    <div class="actions">
      <button v-if="status === 'success'" @click="viewOrder" class="btn btn-primary">
        View Order
      </button>
      <button v-else-if="status === 'failed'" @click="retryPayment" class="btn btn-primary">
        Try Again
      </button>
      <button @click="goHome" class="btn btn-secondary">
        Back to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  orderInfo: {
    type: Object,
    default: null
  }
});

const router = useRouter();

const statusClass = computed(() => {
  const classes = {
    'success': 'status-success',
    'failed': 'status-failed',
    'cancelled': 'status-cancelled',
    'pending': 'status-pending'
  };
  return classes[props.status] || 'status-pending';
});

const statusTitle = computed(() => {
  const titles = {
    'success': 'Payment Successful',
    'failed': 'Payment Failed',
    'cancelled': 'Payment Cancelled',
    'pending': 'Processing'
  };
  return titles[props.status] || 'Processing';
});

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.orderInfo?.currency || 'USD'
  }).format(amount);
}

function viewOrder() {
  router.push(`/orders/${props.orderInfo?.orderId}`);
}

function retryPayment() {
  router.push('/checkout');
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.payment-status {
  text-align: center;
  padding: 40px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.status-icon .icon {
  font-size: 40px;
  color: white;
}

.status-success {
  background: #4caf50;
}

.status-failed {
  background: #f44336;
}

.status-cancelled {
  background: #ff9800;
}

.status-pending {
  background: #9e9e9e;
}

.status-title {
  margin-bottom: 10px;
  font-size: 24px;
}

.status-message {
  color: #666;
  margin-bottom: 20px;
}

.order-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 30px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-primary {
  background: #0070ba;
  color: white;
}

.btn-primary:hover {
  background: #005ea6;
}

.btn-secondary {
  background: white;
  color: #333;
  border: 1px solid #ccc;
}

.btn-secondary:hover {
  background: #f5f5f5;
}
</style>
