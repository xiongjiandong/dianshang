let isLoading = false;
let isLoaded = false;
let paypalPromise = null;

/**
 * 动态加载PayPal SDK
 */
export function loadPayPalSDK(options = {}) {
  const {
    clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency = 'USD',
    intent = 'capture',
    locale = 'en_US'
  } = options;

  if (window.paypal && isLoaded) {
    return Promise.resolve(window.paypal);
  }

  if (isLoading && paypalPromise) {
    return paypalPromise;
  }

  isLoading = true;

  paypalPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');

    const params = new URLSearchParams({
      'client-id': clientId,
      currency,
      intent,
      locale
    });

    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve(window.paypal);
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('PayPal SDK加载失败'));
    };

    document.head.appendChild(script);
  });

  return paypalPromise;
}

/**
 * 检查SDK是否已加载
 */
export function isSDKLoaded() {
  return isLoaded && !!window.paypal;
}
