// CTA Modal
const showCTAModal = () => {
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
    laterBtn.addEventListener('click', () => overlay.remove());
  }
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  document.body.appendChild(overlay);
};

// Show modal after 3 seconds on index page
if (document.body.dataset.page === 'index') {
  setTimeout(showCTAModal, 3000);
}
