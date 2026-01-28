import { PRODUCTS } from './products.js';
import { currency, getCart, setCart, showConfirmModal, showSuccessModal } from './common.js';
import { renderRating, showError } from './features.js';

function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

function addToCart(id, qty=1){
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({ id, qty });
  }
  setCart(cart);
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  setCart(cart);
}

function updateQty(id, qty){
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty = qty;
  if(item.qty <= 0){
    removeFromCart(id);
    return;
  }
  setCart(cart);
}

function calcTotals(discountCode = null){
  const cart = getCart();
  const items = cart.map(i => {
    const p = findProduct(i.id);
    return { ...i, product: p, line: (p ? p.price : 0) * i.qty };
  });
  const subtotal = items.reduce((s, x) => s + x.line, 0);
  
  // Apply discount
  let discount = 0;
  const validCodes = {
    'SAVE20': 0.20,
    'WELCOME10': 0.10,
    'SAVE15': 0.15
  };
  if(discountCode && validCodes[discountCode.toUpperCase()]){
    discount = subtotal * validCodes[discountCode.toUpperCase()];
  }
  
  const tax = (subtotal - discount) * 0.0825; // example tax rate
  const total = subtotal - discount + tax;
  return { items, subtotal, discount, tax, total, discountCode };
}

function renderMiniSummary(targetId, discountCode = null){
  const el = document.getElementById(targetId);
  if(!el) return;
  const { items, subtotal, discount, tax, total } = calcTotals(discountCode);
  if(items.length === 0){
    el.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    return;
  }
  el.innerHTML = `
    <table class="table checkout-summary-table" aria-label="Cart summary">
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Line</th></tr>
      </thead>
      <tbody>
        ${items.map(x => `
          <tr>
            <td>${x.product?.name ?? x.id}</td>
            <td>${x.qty}</td>
            <td>${currency(x.line)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="split" style="margin-top:12px;">
      <div class="muted">Subtotal</div><div class="price">${currency(subtotal)}</div>
    </div>
    ${discount > 0 ? `
    <div class="split">
      <div class="muted">Discount</div><div class="price" style="color: #16a34a;">-${currency(discount)}</div>
    </div>
    ` : ''}
    <div class="split">
      <div class="muted">Estimated Tax</div><div class="price">${currency(tax)}</div>
    </div>
    <hr class="sep" />
    <div class="split">
      <div><strong>Total</strong></div><div class="price">${currency(total)}</div>
    </div>
  `;
}

function renderProductsGrid(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = PRODUCTS.map(p => `
    <article class="product" data-category="${p.category}" data-tags="${(p.tags || []).join(' ')}" aria-label="${p.name}">
      ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge === 'bestseller' ? 'Best Seller' : p.badge === 'sale' ? 'Sale' : 'New'}</div>` : ''}
      <div class="thumb" style="background-image: url('${p.image || ''}'); background-size: cover; background-position: center;" aria-hidden="true"></div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="price">
          ${currency(p.price)}
          ${p.oldPrice ? `<span class="price-old">${currency(p.oldPrice)}</span>` : ''}
          ${p.oldPrice ? `<span class="price-save">Save ${Math.round((1 - p.price/p.oldPrice) * 100)}%</span>` : ''}
        </div>
        ${p.rating ? renderRating(p.rating, p.reviews || 0) : ''}
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
  el.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('loading');
      setTimeout(() => {
        addToCart(btn.getAttribute('data-add'), 1);
        btn.classList.remove('loading');
        showSuccessModal('Item added to cart.');
      }, 300);
    });
  });
}

function renderProductDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const p = findProduct(id);
  const el = document.getElementById('product-detail');
  if(!el) return;

  if(!p){
    el.innerHTML = `
      <div class="card">
        <div class="notice danger">Product not found.</div>
        <a class="btn" href="products.html" style="margin-top: 12px;">Back to Products</a>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div class="grid">
      <div class="col-8">
        <div class="card">
          <div class="h-eyebrow">${p.category}</div>
          <h1 style="margin-top:10px;">${p.name}</h1>
          <p class="lead">${p.details}</p>
          <div class="pills" style="margin-top:12px;">
            ${(p.tags || []).map(t => `<span class="pill">${t}</span>`).join('')}
          </div>
          <hr class="sep" />
          <div class="split">
            <div class="price" style="font-size:20px;">${currency(p.price)}</div>
            <div class="form-row" style="align-items:center;">
              <div class="field" style="flex: 0 0 120px;">
                <label for="qty">Quantity</label>
                <input id="qty" type="number" min="1" max="99" value="1" aria-label="Product quantity" />
              </div>
              <button class="btn primary" id="btn-add" type="button">Add to Cart</button>
            </div>
          </div>
          <p class="help" id="page-message" aria-live="polite" style="margin-top:12px;"></p>
        </div>
      </div>
      <div class="col-4">
        <div class="card">
          <div class="footer-title">Tips</div>
          <p class="small">This is a prototype. Cart items are stored locally and persist between pages.</p>
          <a class="btn" href="products.html">Back to Products</a>
        </div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById('btn-add');
  const qtyInput = document.getElementById('qty');
  
  // Validate quantity input
  qtyInput.addEventListener('input', () => {
    const val = parseInt(qtyInput.value, 10);
    if(isNaN(val) || val < 1){
      qtyInput.value = 1;
    }
  });
  
  addBtn.addEventListener('click', () => {
    const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
    addToCart(p.id, qty);
    showSuccessModal(`Added ${qty} ${qty > 1 ? 'items' : 'item'} to cart.`);
  });
}

function renderCartPage(){
  const target = document.getElementById('cart-table');
  if(!target) return;

  const { items, subtotal, tax, total } = calcTotals();
  if(items.length === 0){
    target.innerHTML = `<div class="notice">Your cart is empty. <a href="products.html">Browse products</a>.</div>`;
    const totals = document.getElementById('cart-totals');
    if(totals) totals.innerHTML = '';
    // Disable checkout button in header
    const checkoutBtn = document.querySelector('.split .btn.primary[href="checkout.html"]');
    if(checkoutBtn){
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
    }
    return;
  }

  target.innerHTML = `
    <table class="table" aria-label="Shopping cart">
      <thead>
        <tr><th>Item</th><th>Price</th><th>Qty</th><th>Line</th><th></th></tr>
      </thead>
      <tbody>
        ${items.map(x => `
          <tr>
            <td>
              <strong>${x.product?.name ?? x.id}</strong><br/>
              <span class="muted">${x.product?.category ?? ''}</span>
            </td>
            <td>${currency(x.product?.price ?? 0)}</td>
            <td>
              <input type="number" min="1" max="99" value="${x.qty}" data-qty="${x.id}" aria-label="Quantity for ${x.product?.name ?? x.id}" />
            </td>
            <td>${currency(x.line)}</td>
            <td>
              <button class="btn danger" type="button" data-remove="${x.id}">Remove</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  target.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-remove');
      const product = findProduct(id);
      const productName = product?.name || 'this item';
      showConfirmModal(`Remove "${productName}" from your cart?`, () => {
        removeFromCart(id);
        showSuccessModal(`"${productName}" removed from cart.`);
        renderCartPage();
      });
    });
  });

  target.querySelectorAll('[data-qty]').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = inp.getAttribute('data-qty');
      let qty = parseInt(inp.value || '1', 10);
      if(isNaN(qty) || qty < 1){
        qty = 1;
        inp.value = '1';
      }
      if(qty > 99){
        qty = 99;
        inp.value = '99';
      }
      updateQty(id, qty);
      renderCartPage();
    });
  });

  const totals = document.getElementById('cart-totals');
  if(totals){
    totals.innerHTML = `
      <div class="card">
        <div class="footer-title">Totals</div>
        <div class="split" style="margin-top:10px;"><div class="muted">Subtotal</div><div class="price">${currency(subtotal)}</div></div>
        <div class="split"><div class="muted">Estimated Tax</div><div class="price">${currency(tax)}</div></div>
        <hr class="sep" />
        <div class="split"><div><strong>Total</strong></div><div class="price">${currency(total)}</div></div>
        <div class="split" style="margin-top:12px;">
          <a class="btn" href="products.html">Continue Shopping</a>
          <a class="btn primary" href="checkout.html">Proceed to Checkout</a>
        </div>
      </div>
    `;
  }
}

function handleCheckout(){
  const form = document.getElementById('checkout-form');
  if(!form) return;
  
  let appliedDiscount = null;
  
  // Check if cart is empty on page load
  const cart = getCart();
  if(cart.length === 0){
    const msg = document.getElementById('page-message');
    if(msg){
      msg.textContent = 'Your cart is empty. Please add items before checking out.';
      msg.className = 'notice danger';
    }
    // Disable form
    form.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
  }
  
  renderMiniSummary('checkout-summary');
  
  // Handle discount code
  const applyBtn = document.getElementById('apply-discount');
  const discountInput = document.getElementById('discount-code');
  const discountMsg = document.getElementById('discount-message');
  
  if(applyBtn && discountInput && discountMsg){
    applyBtn.addEventListener('click', () => {
      const code = discountInput.value.trim().toUpperCase();
      if(!code){
        discountMsg.textContent = 'Please enter a discount code.';
        discountMsg.style.color = '#dc2626';
        return;
      }
      
      const validCodes = ['SAVE20', 'WELCOME10', 'SAVE15'];
      if(validCodes.includes(code)){
        appliedDiscount = code;
        renderMiniSummary('checkout-summary', appliedDiscount);
        discountMsg.textContent = `✓ Discount code "${code}" applied successfully!`;
        discountMsg.style.color = '#16a34a';
        applyBtn.disabled = true;
        discountInput.disabled = true;
      } else {
        discountMsg.textContent = 'Invalid discount code. Please try again.';
        discountMsg.style.color = '#dc2626';
      }
    });
  }
  
  // Expose function globally for cart updates
  window.renderCheckoutSummary = () => {
    renderMiniSummary('checkout-summary', appliedDiscount);
    const currentCart = getCart();
    if(currentCart.length === 0){
      const msg = document.getElementById('page-message');
      if(msg){
        msg.textContent = 'Your cart is empty. Please add items before checking out.';
        msg.className = 'notice danger';
      }
      form.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = getCart();
    if(cart.length === 0){
      const msg = document.getElementById('page-message');
      msg.textContent = 'Your cart is empty.';
      msg.className = 'notice danger';
      return;
    }
    
    // Validate ZIP code
    const zip = document.getElementById('zip').value.trim();
    if(!/^\d{5}$/.test(zip)){
      const msg = document.getElementById('page-message');
      msg.textContent = 'Please enter a valid 5-digit ZIP code.';
      msg.className = 'notice danger';
      document.getElementById('zip').focus();
      return;
    }
    
    const orderId = 'PS-' + Math.random().toString(16).slice(2, 8).toUpperCase();
    const now = new Date().toISOString();
    const payload = {
      orderId,
      createdAt: now,
      customer: {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
      },
      shipping: {
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value.trim(),
      },
      payment: {
        method: document.getElementById('pay-method').value,
        last4: (document.getElementById('card').value.trim().slice(-4) || '0000'),
      },
      totals: calcTotals(appliedDiscount),
      status: "Processing"
    };
    localStorage.setItem('ps_last_order', JSON.stringify(payload));
    // Create a tiny order index for lookup
    const idx = JSON.parse(localStorage.getItem('ps_order_index') || '[]');
    idx.unshift({ orderId, email: payload.customer.email, status: payload.status, createdAt: now });
    localStorage.setItem('ps_order_index', JSON.stringify(idx.slice(0, 25)));
    // Clear cart and redirect
    setCart([]);
    location.href = `confirmation.html?orderId=${encodeURIComponent(orderId)}`;
  });
}

function renderConfirmation(){
  const el = document.getElementById('confirmation');
  if(!el) return;

  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  const last = JSON.parse(localStorage.getItem('ps_last_order') || 'null');
  if(!last || (orderId && last.orderId !== orderId)){
    el.innerHTML = `<div class="notice danger">No recent order found. Please complete checkout first.</div>`;
    return;
  }

  el.innerHTML = `
    <div class="card">
      <div class="h-eyebrow">Order Confirmed</div>
      <h1 style="margin-top:10px;">Thank You for Your Purchase!</h1>
      <p class="lead">Your order <strong>${last.orderId}</strong> has been received and is being processed.</p>
      <hr class="sep"/>
      <div class="kpis">
        <div class="kpi">
          <div class="label">Email</div>
          <div class="value">${last.customer.email || '—'}</div>
          <div class="hint">Confirmation sent</div>
        </div>
        <div class="kpi">
          <div class="label">Payment</div>
          <div class="value">${last.payment.method} •••• ${last.payment.last4}</div>
          <div class="hint">Secure transaction</div>
        </div>
        <div class="kpi">
          <div class="label">Order Date</div>
          <div class="value">${new Date(last.createdAt).toLocaleDateString()}</div>
          <div class="hint">Processing now</div>
        </div>
      </div>
      <hr class="sep"/>
      <div class="notice">
        <strong>✓ What's Next?</strong><br/>
        Your digital products will be delivered to ${last.customer.email} within minutes. Check your inbox for download links and access instructions.
      </div>
      <hr class="sep"/>
      <div class="split">
        <a class="btn" href="order-status.html">Track This Order</a>
        <a class="btn primary" href="products.html">Continue Shopping</a>
      </div>
    </div>
  `;
}

function handleOrderLookup(){
  const form = document.getElementById('order-form');
  const result = document.getElementById('order-result');
  if(!form || !result) return;

  const index = JSON.parse(localStorage.getItem('ps_order_index') || '[]');
  const table = document.getElementById('recent-orders');
  if(table){
    if(index.length === 0){
      table.innerHTML = `<p class="muted">No recent orders stored in this browser yet.</p>`;
    }else{
      table.innerHTML = `
        <table class="table" aria-label="Recent orders">
          <thead><tr><th>Order</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            ${index.slice(0,8).map(x => `
              <tr>
                <td>${x.orderId}</td>
                <td>${x.email || '—'}</td>
                <td>${x.status}</td>
                <td>${new Date(x.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderId = document.getElementById('orderId').value.trim().toUpperCase();
    const email = document.getElementById('orderEmail').value.trim().toLowerCase();
    
    // Basic validation
    if(!orderId || !email){
      result.innerHTML = `<div class="notice danger">Please enter both Order ID and Email.</div>`;
      return;
    }
    
    // Email format validation
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      result.innerHTML = `<div class="notice danger">Please enter a valid email address.</div>`;
      return;
    }

    const match = index.find(x => x.orderId.toUpperCase() === orderId && (x.email || '').toLowerCase() === email);
    if(!match){
      result.innerHTML = `<div class="notice danger">No matching order found in this browser. Tip: complete checkout first.</div>`;
      return;
    }

    result.innerHTML = `
      <div class="notice">
        <strong>Order ${match.orderId}</strong><br/>
        Status: <strong>${match.status}</strong><br/>
        Created: ${new Date(match.createdAt).toLocaleString()}
      </div>
    `;
  });
}

export {
  addToCart,
  renderProductsGrid,
  renderProductDetail,
  renderCartPage,
  handleCheckout,
  renderConfirmation,
  handleOrderLookup,
  renderMiniSummary
};
