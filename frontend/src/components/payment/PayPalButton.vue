<template>
  <div class="paypal-button-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-placeholder">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading PayPal...</span>
    </div>

    <!-- PayPal Button -->
    <div ref="buttonContainer" id="paypal-button-container" v-show="!loading && !error"></div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { loadPayPalSDK } from '@/utils/paypal-sdk';
import { createPaymentOrder, capturePayment } from '@/api/payment';

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  }
});

const emit = defineEmits([
  'create-start',
  'create-success',
  'create-error',
  'approve-start',
  'payment-success',
  'payment-error',
  'payment-cancel'
]);

const loading = ref(true);
const error = ref(null);
const buttonContainer = ref(null);
let paypalInstance = null;
let buttonsInstance = null;

onMounted(async () => {
  await initializePayPal();
});

onUnmounted(() => {
  if (buttonsInstance) {
    try {
      buttonsInstance.close();
    } catch (e) {}
  }
});

async function initializePayPal() {
  try {
    loading.value = true;
    error.value = null;

    paypalInstance = await loadPayPalSDK({
      currency: props.currency,
      intent: 'capture'
    });

    await renderPayPalButton();

    loading.value = false;
  } catch (err) {
    console.error('PayPal initialization failed:', err);
    error.value = 'Failed to load PayPal, please refresh and try again';
    loading.value = false;
    emit('create-error', err);
  }
}

async function renderPayPalButton() {
  try {
    buttonsInstance = await paypalInstance.Buttons(getButtonConfig()).render(buttonContainer.value);
  } catch (err) {
    console.error('Failed to render button:', err);
    throw err;
  }
}

function getButtonConfig() {
  return {
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
      height: 50,
      tagline: false
    },

    createOrder: async () => {
      try {
        emit('create-start');

        const response = await createPaymentOrder({
          orderId: props.orderId,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        });

        if (response.success) {
          emit('create-success', response.data);
          return response.data.paypalOrderId;
        } else {
          throw new Error(response.message || 'Failed to create payment order');
        }
      } catch (error) {
        emit('create-error', error);
        throw error;
      }
    },

    onApprove: async (data) => {
      try {
        emit('approve-start', data);

        const response = await capturePayment({
          paypalOrderId: data.orderID
        });

        if (response.success) {
          emit('payment-success', response.data);
        } else {
          throw new Error(response.message || 'Payment processing failed');
        }
      } catch (error) {
        emit('payment-error', error);
      }
    },

    onCancel: (data) => {
      emit('payment-cancel', data);
    },

    onError: (err) => {
      console.error('PayPal error:', err);
      error.value = 'An error occurred during payment, please try again';
      emit('payment-error', err);
    }
  };
}

function retryLoad() {
  error.value = null;
  initializePayPal();
}
</script>

<style scoped>
.paypal-button-container {
  min-height: 50px;
  width: 100%;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #f5f5f5;
  border-radius: 8px;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #0070ba;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 25px;
  background: #fff3e0;
  border-radius: 8px;
  color: #d32f2f;
  text-align: center;
}

.error-icon {
  font-size: 28px;
}

.retry-btn {
  padding: 10px 24px;
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #005ea6;
}
</style>
