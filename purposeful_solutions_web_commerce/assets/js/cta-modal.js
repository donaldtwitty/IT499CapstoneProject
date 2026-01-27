// CTA Modal
const showCTAModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>🎁 Special Offer Just For You!</h3>
      <p>Get <strong>20% OFF</strong> your first purchase. Don't miss out on premium digital products at unbeatable prices!</p>
      <div class="modal-actions">
        <button class="btn" onclick="this.closest('.modal-overlay').remove()">Maybe Later</button>
        <a href="products.html" class="btn primary">Shop Now →</a>
      </div>
    </div>
  `;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  document.body.appendChild(overlay);
};

// Show modal after 3 seconds on index page
if (document.body.dataset.page === 'index') {
  setTimeout(showCTAModal, 3000);
}
