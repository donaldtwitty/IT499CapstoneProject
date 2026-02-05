// Bundled app.js - combines common.js, features.js, pages.js, and cta-modal.js
import { renderProductsGrid, renderProductDetail, renderCartPage, handleCheckout, renderConfirmation, handleOrderLookup } from './cart.js';

// ===== COMMON.JS =====
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function currency(n){
  try{
    const num = Number(n);
    if(isNaN(num)) return '$0.00';
    return currencyFormatter.format(num);
  }catch(e){
    return '$0.00';
  }
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
  const count = cartCount();
  const badge = document.querySelector('[data-cart-badge]');
  if(badge){
    badge.textContent = String(count);
  }
  const checkoutBtn = document.getElementById('btn-checkout');
  if(checkoutBtn){
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
  if(typeof message !== 'string') message = String(message);
  if(typeof onConfirm !== 'function') return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.setAttribute('aria-modal', 'true');
  
  const title = document.createElement('h3');
  title.id = 'modal-title';
  title.textContent = 'Confirm Action';
  
  const messageP = document.createElement('p');
  messageP.textContent = message;
  
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  actions.innerHTML = '<button class="btn" id="modal-cancel">Cancel</button><button class="btn danger" id="modal-confirm">Confirm</button>';
  
  modal.appendChild(title);
  modal.appendChild(messageP);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  
  let userInteracted = false;
  overlay.addEventListener('mousedown', () => { userInteracted = true; });
  overlay.addEventListener('touchstart', () => { userInteracted = true; });
  
  document.body.appendChild(overlay);
  
  const cancelBtn = overlay.querySelector('#modal-cancel');
  const confirmBtn = overlay.querySelector('#modal-confirm');
  
  const close = () => {
    overlay.remove();
  };
  
  if(cancelBtn) cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) close();
  });
  
  if(confirmBtn){
    confirmBtn.addEventListener('click', () => {
      if(!userInteracted) return;
      try{
        onConfirm();
        close();
      }catch(e){
        console.error('Error in confirm callback:', e);
        close();
      }
    });
    confirmBtn.focus();
  }
}

function showSuccessModal(message){
  if(typeof message !== 'string') message = String(message);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal success';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.setAttribute('aria-modal', 'true');
  
  const title = document.createElement('h3');
  title.id = 'modal-title';
  title.textContent = '✓ Success';
  
  const messageP = document.createElement('p');
  messageP.textContent = message;
  
  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  actions.innerHTML = '<button class="btn primary" id="modal-ok">OK</button>';
  
  modal.appendChild(title);
  modal.appendChild(messageP);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  
  let userInteracted = false;
  overlay.addEventListener('mousedown', () => { userInteracted = true; });
  overlay.addEventListener('touchstart', () => { userInteracted = true; });
  
  document.body.appendChild(overlay);
  
  const okBtn = overlay.querySelector('#modal-ok');
  
  const close = () => {
    overlay.remove();
  };
  
  if(okBtn){
    okBtn.addEventListener('click', close);
    okBtn.focus();
  }
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) close();
  });
  
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
              <img src="assets/img/logo.png" alt="Purposeful Solutions" class="logo" loading="lazy" />
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
      
      navOverlay.addEventListener('click', closeMenu);
      
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
      });
      
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if(window.innerWidth > 980 && navLinks.classList.contains('active')){
            closeMenu();
          }
        }, 100);
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
        const currentPage = document.body.getAttribute('data-page');
        if(currentPage === 'cart'){
          import('./cart.js').then(m => m.renderCartPage());
        }
        if(typeof window.renderCheckoutSummary === 'function'){ window.renderCheckoutSummary(); }
      });
    });
  }

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

// ===== FEATURES.JS =====
function initSearch() {
  const searchInput = document.getElementById('product-search');
  if (!searchInput) return;

  let searchTimeout;
  let userInitiated = false;
  
  searchInput.addEventListener('focus', () => { userInitiated = true; });
  searchInput.addEventListener('input', (e) => {
    if(!userInitiated) return;
    const query = e.target.value.toLowerCase().trim();
    
    clearTimeout(searchTimeout);
    
    if (window.location.pathname.includes('products.html')) {
      if(query.length === 0){
        document.querySelectorAll('.product').forEach(p => p.style.display = 'flex');
        const msg = document.getElementById('page-message');
        if(msg){
          msg.textContent = '';
          msg.className = 'help';
        }
      }else{
        filterProducts(query);
      }
    } else if (query.length >= 2) {
      searchTimeout = setTimeout(() => {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }, 800);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if(!userInitiated) return;
      e.preventDefault();
      const query = e.target.value.toLowerCase().trim();
      if (query && !window.location.pathname.includes('products.html')) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery && window.location.pathname.includes('products.html')) {
    searchInput.value = searchQuery;
    setTimeout(() => filterProducts(searchQuery.toLowerCase()), 100);
  }
}

function filterProducts(query) {
  const products = document.querySelectorAll('.product');
  const msg = document.getElementById('page-message');
  let visibleCount = 0;
  
  products.forEach(product => {
    const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
    const category = product.dataset.category?.toLowerCase() || '';
    const tags = product.dataset.tags?.toLowerCase() || '';
    
    const matches = name.includes(query) || category.includes(query) || tags.includes(query);
    product.style.display = matches ? 'flex' : 'none';
    if(matches) visibleCount++;
  });
  
  if(msg){
    if(visibleCount === 0){
      msg.textContent = `No products found matching "${query}". Try a different search term.`;
      msg.className = 'notice';
    }else{
      msg.textContent = '';
      msg.className = 'help';
    }
  }
}

function renderRating(rating, reviews) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const TOTAL_STARS = 5;
  
  let stars = '';
  for (let i = 0; i < TOTAL_STARS; i++) {
    if (i < fullStars) {
      stars += '<span class="star filled">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<span class="star filled">☆</span>';
    } else {
      stars += '<span class="star">☆</span>';
    }
  }
  
  return `
    <div class="rating">
      ${stars}
      <span class="rating-text">(${reviews} reviews)</span>
    </div>
  `;
}

function renderBreadcrumb(items) {
  if(!Array.isArray(items)) return '';
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${items.map(item => {
        if(!item || typeof item !== 'object') return '';
        const label = String(item.label || '');
        const url = item.url ? String(item.url) : null;
        return url ? `<span><a href="${url}">${label}</a></span>` : `<span>${label}</span>`;
      }).join('')}
    </nav>
  `;
}

function showError(message, element = null) {
  const target = element || document.getElementById('page-message');
  if (target) {
    target.textContent = message;
    target.className = 'notice danger';
    setTimeout(() => {
      target.textContent = '';
      target.className = 'help';
    }, 5000);
  }
}

// ===== PAGES.JS =====
function handleContact(){
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-note');
  if(!form || !note) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!e.isTrusted){
      note.textContent = 'Invalid request.';
      note.className = 'notice danger';
      return;
    }
    
    const nameEl = document.getElementById('cname');
    const emailEl = document.getElementById('cemail');
    const msgEl = document.getElementById('cmsg');
    if(!nameEl || !emailEl || !msgEl) return;
    
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const msg = msgEl.value.trim();
    if(!name || !email || !msg){
      note.textContent = 'Please complete all fields.';
      note.className = 'notice danger';
      return;
    }
    note.textContent = 'Message sent! Our support team will respond within 24 hours.';
    note.className = 'notice';
    try{
      form.reset();
    }catch(e){
      console.error('Form reset error:', e);
    }
  });
}

function renderFeaturedProducts(){
  const el = document.getElementById('featured-grid');
  if(!el) return;
  
  import('./products.js').then(module => {
    const PRODUCTS = module.PRODUCTS;
    const topProducts = [...PRODUCTS].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    
    el.innerHTML = topProducts.map(p => `
      <article class="product" data-category="${p.category}" data-tags="${(p.tags || []).join(' ')}" aria-label="${p.name}">
        ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge === 'bestseller' ? 'Best Seller' : p.badge === 'sale' ? 'Sale' : 'New'}</div>` : ''}
        <div class="thumb" style="background-image: url('${p.image || ''}'); background-size: cover; background-position: center;" loading="lazy" aria-hidden="true"></div>
        <div class="body">
          <h3>${p.name}</h3>
          <div class="price">
            ${currency(p.price)}
            ${p.oldPrice ? `<span class="price-old">${currency(p.oldPrice)}</span>` : ''}
            ${p.oldPrice ? `<span class="price-save">Save ${Math.round((1 - p.price/p.oldPrice) * 100)}%</span>` : ''}
          </div>
          <div class="pills mt-10">
            <span class="pill">${p.category}</span>
            ${(p.tags || []).slice(0,2).map(t=>`<span class="pill">${t}</span>`).join('')}
          </div>
          <p class="muted">${p.short}</p>
          <div class="split mt-10">
            <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">View Details</a>
            <button class="btn primary" data-add="${p.id}" type="button">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join('');
    
    import('./cart.js').then(cartModule => {
      el.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.add('loading');
          setTimeout(() => {
            cartModule.addToCart(btn.getAttribute('data-add'), 1);
            btn.classList.remove('loading');
            showSuccessModal('Item added to cart.');
          }, 300);
        });
      });
    });
  });
}

function addBreadcrumbs() {
  const page = document.body.getAttribute('data-page');
  const container = document.getElementById('breadcrumb-container');
  if (!container) return;

  const breadcrumbs = {
    'products': [{ label: 'Home', url: 'index.html' }, { label: 'Products' }],
    'product': [{ label: 'Home', url: 'index.html' }, { label: 'Products', url: 'products.html' }, { label: 'Product Details' }],
    'cart': [{ label: 'Home', url: 'index.html' }, { label: 'Cart' }],
    'checkout': [{ label: 'Home', url: 'index.html' }, { label: 'Cart', url: 'cart.html' }, { label: 'Checkout' }]
  };

  if (breadcrumbs[page]) {
    container.innerHTML = renderBreadcrumb(breadcrumbs[page]);
  }
}

// ===== CTA-MODAL.JS =====
function showCTAModal() {
  if(document.querySelector('.modal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>🎁 Special Offer Just For You!</h3>
      <p>Get <strong>20% OFF</strong> your first purchase. Don't miss out on premium digital products at unbeatable prices!</p>
      <div class="modal-actions">
        <button class="btn" id="cta-later">Maybe Later</button>
        <a href="products.html" class="btn primary">Shop Now →</a>
      </div>
    </div>
  `;
  
  const laterBtn = overlay.querySelector('#cta-later');
  if(laterBtn){
    laterBtn.addEventListener('click', (e) => {
      if(e.isTrusted) overlay.remove();
    });
  }
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && e.isTrusted) overlay.remove();
  });
  
  document.body.appendChild(overlay);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  injectHeaderFooter();
  initSearch();
  
  const page = document.body.getAttribute('data-page');
  addBreadcrumbs();

  switch(page){
    case 'products':
      renderProductsGrid('products-grid');
      break;
    case 'product':
      renderProductDetail();
      break;
    case 'cart':
      renderCartPage();
      break;
    case 'checkout':
      handleCheckout();
      break;
    case 'confirmation':
      renderConfirmation();
      break;
    case 'order-status':
      handleOrderLookup();
      break;
    case 'contact':
      handleContact();
      break;
    case 'index':
      renderFeaturedProducts();
      if (document.body.dataset.page === 'index') {
        setTimeout(showCTAModal, 3000);
      }
      break;
  }
});

export { currency, getCart, setCart, updateCartBadge, showConfirmModal, showSuccessModal, renderRating, renderBreadcrumb, showError };
