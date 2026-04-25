<template>
  <div class="privacy-page">
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

    <div class="privacy-container">
      <div class="privacy-header">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: January 1, 2024</p>
      </div>

      <div class="privacy-content">
        <section class="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to My Store ("we," "our," or "us"). We are committed to protecting your privacy
            and ensuring the security of your personal information. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you visit our website
            and use our services.
          </p>
        </section>

        <section class="policy-section">
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you provide directly to us, including:</p>
          <ul>
            <li>Name and email address (when you sign in via Google, GitHub, or Microsoft)</li>
            <li>Profile picture from your social media accounts</li>
            <li>Shipping address and phone number (when you place an order)</li>
            <li>Payment information (processed securely through PayPal)</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>When you use our services, we automatically collect:</p>
          <ul>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
            <li>Pages visited and time spent on our site</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Processing and fulfilling your orders</li>
            <li>Communicating with you about your orders and account</li>
            <li>Sending promotional emails (with your consent)</li>
            <li>Improving our website and services</li>
            <li>Detecting and preventing fraud</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>4. Third-Party Services</h2>
          <h3>4.1 Authentication Services</h3>
          <p>
            We use Google, GitHub, and Microsoft for authentication. When you sign in using these
            services, we receive your basic profile information (name, email, and profile picture).
            Please refer to their respective privacy policies:
          </p>
          <ul>
            <li><a href="https://policies.google.com/privacy" target="_blank">Google Privacy Policy</a></li>
            <li><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank">GitHub Privacy Statement</a></li>
            <li><a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank">Microsoft Privacy Statement</a></li>
          </ul>

          <h3>4.2 Payment Processing</h3>
          <p>
            We use PayPal for payment processing. PayPal handles your payment information securely
            and in accordance with their privacy policy. We do not store your complete credit card
            or bank account details on our servers.
          </p>
          <ul>
            <li><a href="https://www.paypal.com/us/webapps/mpp/ua/privacy-full" target="_blank">PayPal Privacy Policy</a></li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction. These
            measures include:
          </p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure storage of authentication tokens</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services
            and comply with legal obligations. Order information is retained for a minimum of
            7 years for tax and accounting purposes.
          </p>
        </section>

        <section class="policy-section">
          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to certain processing of your data</li>
          </ul>
          <p>
            To exercise these rights, please contact us at
            <a href="mailto:privacy@mystore.com">privacy@mystore.com</a>
          </p>
        </section>

        <section class="policy-section">
          <h2>8. Cookies</h2>
          <p>
            We use cookies and similar technologies to improve your experience, analyze usage,
            and personalize content. You can manage cookie preferences through your browser settings.
          </p>
          <h3>Types of Cookies We Use:</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Authentication Cookies:</strong> Keep you signed in</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you believe we have collected
            information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section class="policy-section">
          <h2>10. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place to protect your data in compliance with
            applicable data protection laws.
          </p>
        </section>

        <section class="policy-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the new Privacy Policy on this page and updating the "Last Updated"
            date at the top of this policy.
          </p>
        </section>

        <section class="policy-section">
          <h2>12. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@mystore.com">privacy@mystore.com</a></li>
            <li>Address: 123 Commerce Street, Tech City, TC 12345</li>
          </ul>
        </section>
      </div>

      <div class="privacy-footer">
        <router-link to="/terms" class="footer-link">Terms of Service</router-link>
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
.privacy-page {
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

.privacy-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.privacy-header {
  text-align: center;
  margin-bottom: 40px;
}

.privacy-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.last-updated {
  color: #666;
  font-size: 14px;
}

.privacy-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.policy-section {
  margin-bottom: 30px;
}

.policy-section:last-child {
  margin-bottom: 0;
}

.policy-section h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #0070ba;
}

.policy-section h3 {
  font-size: 18px;
  color: #444;
  margin: 20px 0 10px;
}

.policy-section p {
  color: #555;
  line-height: 1.8;
  margin-bottom: 15px;
}

.policy-section ul {
  color: #555;
  line-height: 1.8;
  padding-left: 25px;
  margin-bottom: 15px;
}

.policy-section li {
  margin-bottom: 8px;
}

.policy-section a {
  color: #0070ba;
  text-decoration: none;
}

.policy-section a:hover {
  text-decoration: underline;
}

.privacy-footer {
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
  .privacy-content {
    padding: 25px;
  }

  .privacy-header h1 {
    font-size: 28px;
  }

  .policy-section h2 {
    font-size: 20px;
  }
}
</style>
