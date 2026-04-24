<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <!-- Steps -->
      <div class="steps">
        <div class="step" :class="{ active: step >= 1, completed: step > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Cart</span>
        </div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div class="step" :class="{ active: step >= 2, completed: step > 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Shipping</span>
        </div>
        <div class="step-line" :class="{ active: step > 2 }"></div>
        <div class="step" :class="{ active: step >= 3 }">
          <span class="step-number">3</span>
          <span class="step-label">Payment</span>
        </div>
      </div>

      <div class="checkout-content">
        <!-- Shipping Form -->
        <div class="shipping-form">
          <h2>Shipping Information</h2>
          <form @submit.prevent="handleCreateOrder">
            <div class="form-group">
              <label>Recipient Name *</label>
              <input v-model="shippingAddress.recipientName" required placeholder="Enter recipient name" />
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input v-model="shippingAddress.phone" required placeholder="Enter phone number" />
            </div>
            <div class="form-group">
              <label>Address *</label>
              <textarea v-model="shippingAddress.address" required placeholder="Enter full address"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>City *</label>
                <input v-model="shippingAddress.city" required placeholder="Enter city" />
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input v-model="shippingAddress.postalCode" placeholder="Enter postal code" />
              </div>
            </div>
          </form>
        </div>

        <!-- Order Summary & Payment -->
        <div class="order-and-payment">
          <!-- Order Summary -->
          <div class="order-summary">
            <h2>Order Summary</h2>
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">x {{ item.quantity }}</span>
                </div>
                <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="order-total">
              <span>Total:</span>
              <span class="total-amount">${{ totalAmount.toFixed(2) }} {{ currency }}</span>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="payment-section">
            <div class="payment-header">
              <div class="paypal-logo">
                <svg viewBox="0 0 100 32" class="paypal-svg">
                  <path fill="#003087" d="M12.5 4h-8c-.6 0-1.1.4-1.2 1l-3 19c-.1.5.3.9.8.9h3.8c.6 0 1.1-.4 1.2-1l.8-5.2c.1-.6.6-1 1.2-1h2.5c5.2 0 8.2-2.5 9-7.5.4-2.1 0-3.8-1-5-1.1-1.3-3.1-2-5.6-2h-.5z"/>
                  <path fill="#3086C8" d="M38.5 12.1h-4.1c-.3 0-.5.2-.6.5l-.1.5-.2-.3c-.6-.9-2-1.2-3.3-1.2-3.1 0-5.8 2.4-6.3 5.7-.3 1.7.1 3.2 1.1 4.3.9 1 2.2 1.4 3.7 1.4 2.6 0 4.1-1.3 4.1-1.3l-.1.6c-.1.5.3.9.8.9h3.7c.6 0 1.1-.4 1.2-1l2.2-14.1c.1-.5-.3-.9-.8-.9zm-5.8 8.5c-.4 1.6-1.6 2.7-3.2 2.7-.8 0-1.5-.3-1.9-.8-.4-.5-.6-1.3-.4-2.1.4-1.6 1.6-2.7 3.2-2.7.8 0 1.5.3 1.9.8.4.5.5 1.2.4 2.1z"/>
                  <path fill="#003087" d="M55.5 12.1h-4.1c-.3 0-.5.2-.6.5l-.1.5-.2-.3c-.6-.9-2-1.2-3.3-1.2-3.1 0-5.8 2.4-6.3 5.7-.3 1.7.1 3.2 1.1 4.3.9 1 2.2 1.4 3.7 1.4 2.6 0 4.1-1.3 4.1-1.3l-.1.6c-.1.5.3.9.8.9h3.7c.6 0 1.1-.4 1.2-1l2.2-14.1c0-.5-.4-.9-.9-.9zm-5.8 8.5c-.4 1.6-1.6 2.7-3.2 2.7-.8 0-1.5-.3-1.9-.8-.4-.5-.6-1.3-.4-2.1.4-1.6 1.6-2.7 3.2-2.7.8 0 1.5.3 1.9.8.4.5.5 1.2.4 2.1z"/>
                  <path fill="#3086C8" d="M70.3 12h-4.2c-.4 0-.8.2-1 .6l-5.8 8.5-2.4-8.2c-.2-.5-.6-.8-1.1-.8h-4.1c-.5 0-.9.5-.7 1l4.6 13.5-4.3 6.1c-.3.5 0 1.1.6 1.1h4.2c.4 0 .8-.2 1-.5l13.9-20c.3-.6 0-1.1-.6-1.1z"/>
                  <path fill="#003087" d="M80.5 4h-8c-.6 0-1.1.4-1.2 1l-3 19c-.1.5.3.9.8.9h4.1c.3 0 .5-.2.6-.5l.8-5.4c.1-.6.6-1 1.2-1h2.5c5.2 0 8.2-2.5 9-7.5.4-2.1 0-3.8-1-5-1.1-1.2-3.1-1.9-5.7-1.9zm.9 7.4c-.4 2.8-2.5 2.8-4.6 2.8h-1.2l.8-5.2c0-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.5 2.1z"/>
                </svg>
              </div>
              <h2>Pay with PayPal</h2>
            </div>

            <div class="payment-features">
              <div class="feature">
                <span class="feature-icon">🔒</span>
                <span>Secure Payment</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🛡️</span>
                <span>Buyer Protection</span>
              </div>
              <div class="feature">
                <span class="feature-icon">⚡</span>
                <span>Fast Checkout</span>
              </div>
            </div>

            <!-- Confirm Button -->
            <button
              v-if="!orderId"
              class="btn-confirm"
              @click="handleCreateOrder"
              :disabled="isCreatingOrder"
            >
              <span v-if="isCreatingOrder">Processing...</span>
              <span v-else>Continue to PayPal</span>
            </button>

            <!-- PayPal Button -->
            <div v-else class="paypal-section">
              <p class="order-id">Order #: {{ orderNo }}</p>
              <div class="paypal-button-wrapper">
                <PayPalButton
                  :orderId="orderId"
                  :amount="totalAmount"
                  :currency="currency"
                  @create-start="onCreateStart"
                  @create-success="onCreateSuccess"
                  @approve-start="onApproveStart"
                  @payment-success="onPaymentSuccess"
                  @payment-error="onPaymentError"
                  @payment-cancel="onPaymentCancel"
                />
              </div>
            </div>

            <p class="payment-note">
              You will be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { createOrder } from '@/api/order';
import PayPalButton from '@/components/payment/PayPalButton.vue';

const router = useRouter();
const cartStore = useCartStore();

const step = ref(2);
const orderId = ref(null);
const orderNo = ref('');
const isCreatingOrder = ref(false);
const currency = ref('USD');

const cartItems = computed(() => cartStore.items);
const totalAmount = computed(() => cartStore.totalAmount);

const shippingAddress = ref({
  recipientName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  state: '',
  country: 'US'
});

async function handleCreateOrder() {
  if (!validateForm()) {
    alert('Please fill in all required shipping information');
    return;
  }

  if (cartItems.value.length === 0) {
    alert('Your cart is empty');
    return;
  }

  try {
    isCreatingOrder.value = true;

    const response = await createOrder({
      items: cartItems.value.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: shippingAddress.value,
      currency: currency.value
    });

    if (response.success) {
      orderId.value = response.data.orderId;
      orderNo.value = response.data.orderNo;
      step.value = 3;
    } else {
      alert(response.message || 'Failed to create order');
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    alert('Failed to create order, please try again');
  } finally {
    isCreatingOrder.value = false;
  }
}

function validateForm() {
  return shippingAddress.value.recipientName &&
         shippingAddress.value.phone &&
         shippingAddress.value.address &&
         shippingAddress.value.city;
}

function onCreateStart() {
  console.log('Creating payment order...');
}

function onCreateSuccess(data) {
  console.log('PayPal order created:', data);
}

function onApproveStart(data) {
  console.log('Processing payment...', data);
}

function onPaymentSuccess(data) {
  cartStore.clearCart();
  router.push({
    path: '/payment/result',
    query: {
      status: 'success',
      orderId: data.orderId,
      transactionId: data.transactionId
    }
  });
}

function onPaymentError(error) {
  router.push({
    path: '/payment/result',
    query: {
      status: 'failed',
      message: error.message || 'Payment processing failed'
    }
  });
}

function onPaymentCancel() {
  router.push({
    path: '/payment/result',
    query: {
      status: 'cancelled'
    }
  });
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #0070ba;
  color: white;
}

.step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #999;
}

.step.active .step-label {
  color: #0070ba;
  font-weight: 500;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e0e0e0;
  margin: 0 10px;
  margin-bottom: 24px;
  transition: background 0.3s;
}

.step-line.active {
  background: #4caf50;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

@media (max-width: 900px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

.shipping-form {
  background: white;
  padding: 25px;
  border-radius: 8px;
}

.shipping-form h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0070ba;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.order-and-payment {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-summary {
  background: white;
  padding: 25px;
  border-radius: 8px;
}

.order-summary h2 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.cart-items {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
}

.item-quantity {
  font-size: 13px;
  color: #666;
}

.item-price {
  font-weight: 500;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
}

.total-amount {
  color: #0070ba;
}

/* Payment Section */
.payment-section {
  background: linear-gradient(135deg, #0070ba 0%, #003087 100%);
  padding: 25px;
  border-radius: 12px;
  color: white;
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.paypal-logo {
  background: white;
  padding: 8px 15px;
  border-radius: 8px;
}

.paypal-svg {
  width: 80px;
  height: 26px;
}

.payment-header h2 {
  font-size: 20px;
  margin: 0;
}

.payment-features {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.feature-icon {
  font-size: 16px;
}

.btn-confirm {
  width: 100%;
  padding: 16px;
  background: white;
  color: #0070ba;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.btn-confirm:hover:not(:disabled) {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.paypal-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.order-id {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.paypal-button-wrapper {
  min-height: 50px;
}

.payment-note {
  font-size: 12px;
  opacity: 0.8;
  text-align: center;
  margin: 0;
}
</style>
