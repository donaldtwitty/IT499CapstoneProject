import { renderProductsGrid, renderProductDetail, renderCartPage, handleCheckout, renderConfirmation, handleOrderLookup } from './cart.js';
import { renderBreadcrumb } from './features.js';

function handleContact(){
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-note');
  if(!form || !note) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Verify user interaction
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
    // Show top 4 rated products
    const topProducts = [...PRODUCTS].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    
    el.innerHTML = topProducts.map(p => `
      <article class="product" data-category="${p.category}" data-tags="${(p.tags || []).join(' ')}" aria-label="${p.name}">
        ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge === 'bestseller' ? 'Best Seller' : p.badge === 'sale' ? 'Sale' : 'New'}</div>` : ''}
        <div class="thumb" style="background-image: url('${p.image || ''}'); background-size: cover; background-position: center;" aria-hidden="true"></div>
        <div class="body">
          <h3>${p.name}</h3>
          <div class="price">
            ${import('./common.js').then(m => m.currency(p.price))}
            ${p.oldPrice ? `<span class="price-old">${import('./common.js').then(m => m.currency(p.oldPrice))}</span>` : ''}
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
    
    // Add to cart handlers
    import('./cart.js').then(cartModule => {
      el.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.add('loading');
          setTimeout(() => {
            cartModule.addToCart(btn.getAttribute('data-add'), 1);
            btn.classList.remove('loading');
            import('./common.js').then(m => m.showSuccessModal('Item added to cart.'));
          }, 300);
        });
      });
    });
    
    // Fix prices after render
    import('./common.js').then(commonModule => {
      topProducts.forEach((p, idx) => {
        const priceEl = el.querySelectorAll('.price')[idx];
        if(priceEl) {
          let priceHTML = commonModule.currency(p.price);
          if(p.oldPrice) {
            priceHTML += ` <span class="price-old">${commonModule.currency(p.oldPrice)}</span>`;
            priceHTML += ` <span class="price-save">Save ${Math.round((1 - p.price/p.oldPrice) * 100)}%</span>`;
          }
          priceEl.innerHTML = priceHTML;
        }
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

document.addEventListener('DOMContentLoaded', () => {
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
      break;
  }
});
