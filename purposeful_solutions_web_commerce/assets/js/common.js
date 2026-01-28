function currency(n){
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function getCart(){
  try{
    return JSON.parse(localStorage.getItem('ps_cart') || '[]');
  }catch(e){
    return [];
  }
}
function setCart(cart){
  localStorage.setItem('ps_cart', JSON.stringify(cart));
  updateCartBadge();
}

function cartCount(){
  return getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
}

function updateCartBadge(){
  const badge = document.querySelector('[data-cart-badge]');
  if(badge){
    badge.textContent = String(cartCount());
  }
  // Update checkout button state
  const checkoutBtn = document.getElementById('btn-checkout');
  if(checkoutBtn){
    const count = cartCount();
    if(count === 0){
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.setAttribute('aria-disabled', 'true');
    }else{
      checkoutBtn.style.opacity = '1';
      checkoutBtn.style.pointerEvents = 'auto';
      checkoutBtn.removeAttribute('aria-disabled');
    }
  }
}

function showConfirmModal(message, onConfirm){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <h3 id="modal-title">Confirm Action</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn danger" id="modal-confirm">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  const modal = overlay.querySelector('.modal');
  const cancelBtn = overlay.querySelector('#modal-cancel');
  const confirmBtn = overlay.querySelector('#modal-confirm');
  
  const close = () => {
    overlay.remove();
  };
  
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) close();
  });
  
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    close();
  });
  
  confirmBtn.focus();
}

function showSuccessModal(message){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal success" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <h3 id="modal-title">✓ Success</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn primary" id="modal-ok">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  const okBtn = overlay.querySelector('#modal-ok');
  
  const close = () => {
    overlay.remove();
  };
  
  okBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) close();
  });
  
  okBtn.focus();
  
  // Auto-close after 2 seconds
  setTimeout(close, 2000);
}

function injectHeaderFooter(){
  const headerTarget = document.getElementById('site-header');
  const footerTarget = document.getElementById('site-footer');
  const year = new Date().getFullYear();

  if(headerTarget){
    headerTarget.innerHTML = `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="container">
          <div class="navbar">
            <a class="brand" href="index.html" aria-label="Purposeful Solutions home">
              <img src="assets/img/logo.png" alt="Purposeful Solutions" class="logo" />
            </a>
            <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <nav class="nav-links" id="nav-links" aria-label="Primary">
              <a href="index.html" data-nav="index">Home</a>
              <a href="products.html" data-nav="products">Shop</a>
              <a href="cart.html" data-nav="cart">Cart <span class="badge" data-cart-badge>0</span></a>
              <a href="order-status.html" data-nav="order-status">Track Order</a>
              <a href="contact.html" data-nav="contact">Support</a>
            </nav>
            <div class="search-box">
              <input type="search" id="product-search" placeholder="Search products..." aria-label="Search products">
            </div>
            <div class="actions">
              <button class="btn" type="button" id="btn-clear-cart" title="Clear cart">Clear Cart</button>
              <a class="btn primary" href="checkout.html" id="btn-checkout">Checkout</a>
            </div>
          </div>
        </div>
      </header>
      <div class="nav-overlay" id="nav-overlay"></div>
    `;
    
    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navOverlay = document.getElementById('nav-overlay');
    
    const closeMenu = () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      navOverlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    
    const openMenu = () => {
      hamburger.classList.add('active');
      navLinks.classList.add('active');
      navOverlay.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    
    if(hamburger && navLinks && navOverlay){
      hamburger.addEventListener('click', () => {
        if(navLinks.classList.contains('active')){
          closeMenu();
        } else {
          openMenu();
        }
      });
      
      // Close menu when clicking overlay
      navOverlay.addEventListener('click', closeMenu);
      
      // Close menu when clicking nav links
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
      
      // Close menu on window resize if open
      window.addEventListener('resize', () => {
        if(window.innerWidth > 980 && navLinks.classList.contains('active')){
          closeMenu();
        }
      });
    }
  }

  if(footerTarget){
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="card">
              <div class="footer-title">Purposeful Solutions</div>
              <p class="small">
                Your trusted source for premium digital products and professional services. Shop with confidence—instant delivery, lifetime updates, and 30-day money-back guarantee.
              </p>
              <div class="footer-links">
                <a href="about.html">About Us</a>
                <a href="contact.html">Support</a>
                <a href="privacy.html">Privacy</a>
                <a href="accessing.html">Accessibility</a>
              </div>
            </div>
            <div class="card">
              <div class="footer-title">Customer Service</div>
              <p class="small">
                Need help with your order? Our support team is available 24/7 to assist with purchases, refunds, and product questions.
              </p>
              <div class="footer-links">
                <a href="faq.html">FAQ</a>
                <a href="order-status.html">Track Order</a>
                <a href="changelog.html">What's New</a>
              </div>
              <p class="small mt-10">
                © ${year} Purposeful Solutions. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Active link
  const page = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav]').forEach(a => {
    if(a.getAttribute('data-nav') === page){
      a.classList.add('active');
    }
  });

  const clearBtn = document.getElementById('btn-clear-cart');
  if(clearBtn){
    clearBtn.addEventListener('click', () => {
      const cart = getCart();
      if(cart.length === 0){
        showSuccessModal('Your cart is already empty. Add products to get started!');
        return;
      }
      showConfirmModal('Are you sure you want to clear your entire cart?', () => {
        setCart([]);
        showSuccessModal('Cart cleared successfully.');
        // If we're on cart page, re-render
        if(document.body.getAttribute('data-page') === 'cart'){
          import('./cart.js').then(m => m.renderCartPage());
        }
        // If we're on checkout page, re-render summary
        if(typeof window.renderCheckoutSummary === 'function'){ window.renderCheckoutSummary(); }
      });
    });
  }

  // Disable checkout button if cart is empty
  const checkoutBtn = document.getElementById('btn-checkout');
  if(checkoutBtn){
    const count = cartCount();
    if(count === 0){
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.setAttribute('aria-disabled', 'true');
    }
  }

  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', injectHeaderFooter);

export { currency, getCart, setCart, updateCartBadge, showConfirmModal, showSuccessModal };
