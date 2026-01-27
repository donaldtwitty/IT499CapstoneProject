// Enhanced features: search, ratings, breadcrumbs

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('product-search');
  if (!searchInput) return;

  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    if (window.location.pathname.includes('products.html')) {
      // If already on products page, filter immediately
      if(query.length === 0){
        // Show all products when search is cleared
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
      // Only redirect after user stops typing for 800ms
      searchTimeout = setTimeout(() => {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }, 800);
    }
  });

  // Handle Enter key for immediate search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value.toLowerCase().trim();
      if (query && !window.location.pathname.includes('products.html')) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    }
  });

  // Handle search from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery && window.location.pathname.includes('products.html')) {
    searchInput.value = searchQuery;
    // Use setTimeout to ensure products are rendered first
    setTimeout(() => filterProducts(searchQuery.toLowerCase()), 100);
  }
}

function filterProducts(query) {
  const products = document.querySelectorAll('.product');
  let visibleCount = 0;
  
  products.forEach(product => {
    const name = product.querySelector('h3')?.textContent.toLowerCase() || '';
    const category = product.dataset.category?.toLowerCase() || '';
    const tags = product.dataset.tags?.toLowerCase() || '';
    
    const matches = name.includes(query) || category.includes(query) || tags.includes(query);
    product.style.display = matches ? 'flex' : 'none';
    if(matches) visibleCount++;
  });
  
  // Show message if no products match
  const msg = document.getElementById('page-message');
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

// Rating display
function renderRating(rating, reviews) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let stars = '';
  for (let i = 0; i < 5; i++) {
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

// Breadcrumb generation
function renderBreadcrumb(items) {
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${items.map(item => 
        item.url ? `<span><a href="${item.url}">${item.label}</a></span>` : `<span>${item.label}</span>`
      ).join('')}
    </nav>
  `;
}

// Error handling
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

// Initialize features
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
});

export { 
  renderRating, 
  renderBreadcrumb, 
  showError
};