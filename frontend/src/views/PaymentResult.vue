<template>
  <div class="payment-result-page">
    <PaymentStatus
      :status="paymentStatus"
      :message="message"
      :order-info="orderInfo"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PaymentStatus from '@/components/payment/PaymentStatus.vue';
import { getPaymentStatus } from '@/api/payment';

const route = useRoute();

const paymentStatus = computed(() => route.query.status || 'pending');
const message = computed(() => route.query.message || '');

const orderInfo = ref(null);

onMounted(async () => {
  const orderId = route.query.orderId;
  if (orderId && paymentStatus.value === 'success') {
    try {
      const response = await getPaymentStatus(orderId);
      if (response.success) {
        orderInfo.value = {
          orderId: response.data.orderId,
          orderNo: response.data.orderId,
          amount: response.data.amount,
          currency: response.data.currency,
          transactionId: response.data.transactionId
        };
      }
    } catch (error) {
      console.error('Failed to get payment status:', error);
    }
  }
});
</script>

<style scoped>
.payment-result-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}
</style>
