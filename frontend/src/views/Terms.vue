<template>
  <div class="terms-page">
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

    <div class="terms-container">
      <div class="terms-header">
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: January 1, 2024</p>
      </div>

      <div class="terms-content">
        <section class="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using My Store ("the Service"), you accept and agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section class="terms-section">
          <h2>2. Description of Service</h2>
          <p>
            My Store is an e-commerce platform that allows users to browse products, add them to
            a shopping cart, and purchase items using PayPal payment processing. We reserve the
            right to modify, suspend, or discontinue any aspect of the Service at any time.
          </p>
        </section>

        <section class="terms-section">
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the Service, you may need to create an account. When
            creating an account:
          </p>
          <ul>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p>
            We use third-party authentication (Google, GitHub, Microsoft) to simplify the login
            process. By using these services, you agree to their respective terms of service.
          </p>
        </section>

        <section class="terms-section">
          <h2>4. Orders and Payments</h2>
          <h3>4.1 Order Placement</h3>
          <ul>
            <li>All orders are subject to acceptance and availability</li>
            <li>We reserve the right to refuse or cancel any order for any reason</li>
            <li>Prices are subject to change without notice</li>
          </ul>

          <h3>4.2 Payment Processing</h3>
          <ul>
            <li>All payments are processed securely through PayPal</li>
            <li>By placing an order, you represent that you are authorized to use the payment method</li>
            <li>You agree to pay all charges incurred, including applicable taxes and shipping fees</li>
          </ul>

          <h3>4.3 Pricing Errors</h3>
          <p>
            If a product is listed at an incorrect price due to a system error, we reserve the
            right to cancel your order and issue a full refund.
          </p>
        </section>

        <section class="terms-section">
          <h2>5. Shipping and Delivery</h2>
          <ul>
            <li>Shipping times are estimates and not guaranteed delivery dates</li>
            <li>Risk of loss passes to you upon delivery to the carrier</li>
            <li>We are not responsible for delays caused by shipping carriers</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>6. Returns and Refunds</h2>
          <p>Our return policy allows:</p>
          <ul>
            <li>Returns within 30 days of delivery for most items</li>
            <li>Items must be unused and in original packaging</li>
            <li>Refunds will be processed to the original payment method</li>
            <li>Shipping costs for returns may be the customer's responsibility</li>
          </ul>
          <p>
            For detailed return instructions, please contact our customer service at
            <a href="mailto:support@mystore.com">support@mystore.com</a>
          </p>
        </section>

        <section class="terms-section">
          <h2>7. Intellectual Property</h2>
          <p>
            All content on My Store, including text, graphics, logos, images, and software,
            is the property of My Store or its content suppliers and is protected by intellectual
            property laws. You may not:
          </p>
          <ul>
            <li>Copy, modify, or distribute our content without permission</li>
            <li>Use our trademarks without prior written consent</li>
            <li>Reverse engineer or attempt to extract source code from our website</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>8. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Submit false or misleading information</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Engage in any activity that violates applicable laws or regulations</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, My Store shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, including but
            not limited to loss of profits, data, or other intangible losses, resulting from:
          </p>
          <ul>
            <li>Your use or inability to use the Service</li>
            <li>Any unauthorized access to your account</li>
            <li>Any interruption or cessation of the Service</li>
            <li>Any bugs, viruses, or other harmful code transmitted through the Service</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless My Store and its affiliates, officers,
            directors, employees, and agents from any claims, damages, losses, or expenses
            (including reasonable attorney fees) arising from your use of the Service or
            violation of these Terms.
          </p>
        </section>

        <section class="terms-section">
          <h2>11. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or your use of the Service shall be resolved
            through binding arbitration in accordance with the rules of the American Arbitration
            Association. The arbitration shall take place in [Your Jurisdiction].
          </p>
        </section>

        <section class="terms-section">
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of
            significant changes by posting a notice on our website or by sending an email to
            registered users. Your continued use of the Service after changes are posted
            constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section class="terms-section">
          <h2>13. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service at our sole
            discretion, without prior notice, for conduct that we believe violates these Terms
            or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section class="terms-section">
          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            [Your State/Country], without regard to its conflict of law provisions.
          </p>
        </section>

        <section class="terms-section">
          <h2>15. Contact Information</h2>
          <p>For questions about these Terms, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:legal@mystore.com">legal@mystore.com</a></li>
            <li>Address: 123 Commerce Street, Tech City, TC 12345</li>
          </ul>
        </section>
      </div>

      <div class="terms-footer">
        <router-link to="/privacy" class="footer-link">Privacy Policy</router-link>
        <span class="separator">|</span>
        <router-link to="/login" class="footer-link">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  color: #333;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 16px;
}

.nav-link:hover {
  color: #0070ba;
}

.terms-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.terms-header {
  text-align: center;
  margin-bottom: 40px;
}

.terms-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.last-updated {
  color: #666;
  font-size: 14px;
}

.terms-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.terms-section {
  margin-bottom: 30px;
}

.terms-section:last-child {
  margin-bottom: 0;
}

.terms-section h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #0070ba;
}

.terms-section h3 {
  font-size: 18px;
  color: #444;
  margin: 20px 0 10px;
}

.terms-section p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 15px;
}

.terms-section ul {
  color: #555;
  line-height: 1.8;
  padding-left: 25px;
  margin-bottom: 15px;
}

.terms-section li {
  margin-bottom: 8px;
}

.terms-section a {
  color: #0070ba;
  text-decoration: none;
}

.terms-section a:hover {
  text-decoration: underline;
}

.terms-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-link {
  color: #0070ba;
  text-decoration: none;
  font-size: 14px;
}

.footer-link:hover {
  text-decoration: underline;
}

.separator {
  color: #ccc;
  margin: 0 15px;
}

@media (max-width: 768px) {
  .terms-content {
    padding: 25px;
  }

  .terms-header h1 {
    font-size: 28px;
  }

  .terms-section h2 {
    font-size: 20px;
  }
}
</style>
