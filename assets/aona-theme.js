/**
 * Aona India - Theme JavaScript
 * Myntra-style Mobile-First Luxury E-commerce
 */

(function() {
  'use strict';

  // ============================================
  // Global State
  // ============================================
  const AonaTheme = {
    wishlist: JSON.parse(localStorage.getItem('aona_wishlist') || '[]'),
    cart: JSON.parse(localStorage.getItem('aona_cart') || '[]'),
    filters: {
      category: 'all',
      material: [],
      priceMin: 0,
      priceMax: 50000,
      inStock: true,
      express: false,
      handcrafted: false,
      newArrivals: false,
      onSale: false
    },
    currentPage: 1,
    isLoading: false
  };

  // ============================================
  // Initialize on DOM Ready
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initBottomNav();
    initSearch();
    initWishlist();
    initQuickAdd();
    initProductGrid();
    initFilters();
    initInfiniteScroll();
    initMobileCardShadow();
    initContactPopup();
    updateCartCount();
  });

  // ============================================
  // Mobile Menu
  // ============================================
  function initMobileMenu() {
    const menuBtn = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('menuOverlay');
    const closeBtn = document.getElementById('menuClose');

    if (!menuBtn || !menu) return;

    function openMenu() {
      menu.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menu.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
  }

  // ============================================
  // Bottom Navigation
  // ============================================
  function initBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav__item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        const page = this.dataset.page;
        
        // Handle contact popup separately
        if (page === 'contact') {
          e.preventDefault();
          openContactPopup();
          return;
        }
        
        // Update active state
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Navigate to page
        if (page && page !== 'home') {
          window.location.href = '/' + page;
        } else if (page === 'home') {
          window.location.href = '/';
        }
      });
    });
  }

  // ============================================
  // Contact Popup
  // ============================================
  function initContactPopup() {
    const popup = document.getElementById('contact-popup');
    const overlay = document.querySelector('.contact-popup-overlay');
    const closeBtn = document.querySelector('.contact-popup-close');

    if (!popup) return;

    overlay?.addEventListener('click', closeContactPopup);
    closeBtn?.addEventListener('click', closeContactPopup);
  }

  function openContactPopup() {
    const popup = document.getElementById('contact-popup');
    if (!popup) return;

    popup.classList.add('active');
    popup.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeContactPopup() {
    const popup = document.getElementById('contact-popup');
    if (!popup) return;

    popup.classList.remove('active');
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Make globally accessible
  window.openContactPopup = openContactPopup;
  window.closeContactPopup = closeContactPopup;
  // ============================================
  // Search
  // ============================================
  // ============================================
  // Search (Fixed for Header IDs & Images)
  // ============================================

  // Add this function to make the 'X' button work globally and reset the page
function clearSearch() {
  const input = document.getElementById('searchInput') || document.getElementById('header-search-input');
  if (input) {
    input.value = '';
    input.focus();
    
    // If we are on the search page, reload to clear results
    if (window.location.pathname.includes('/search')) {
      window.location.href = '/search';
    }
  }
}
// Make it global
window.clearSearch = clearSearch;
  function initSearch() {
    // TARGET THE CORRECT HEADER IDS
    const searchInput = document.getElementById('header-search-input');
    const searchSuggestions = document.getElementById('header-search-suggestions');

    if (!searchInput || !searchSuggestions) return;

    let searchTimeout;

    // Listen for typing
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      if (query.length > 2) {
        searchTimeout = setTimeout(() => {
          performSearch(query);
        }, 300);
      } else {
        // If input is cleared, hide the dropdown or show default popular searches
        searchSuggestions.classList.remove('active');
        // Optional: You could restore the original "Popular Searches" HTML here if needed
      }
    });

    // Handle "Enter" key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          window.location.href = '/search?q=' + encodeURIComponent(query) + '&type=product';
        }
      }
    });
    
    // Close on click outside
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.classList.remove('active');
      }
    });
  }

  function performSearch(query) {
    // Use Shopify's Predictive Search API
    fetch(`${window.routes.predictive_search_url}?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`)
      .then(response => response.json())
      .then(data => {
        const products = data.resources.results.products;
        displaySearchResults(products);
      })
      .catch(error => console.error('Search error:', error));
  }

  function displaySearchResults(products) {
    const searchSuggestions = document.getElementById('header-search-suggestions');
    // We inject into the existing .suggestions-list container to keep styling
    let listContainer = searchSuggestions.querySelector('.suggestions-list');
    
    // If list container is missing (e.g. simplified header), create/find appropriate wrapper
    if (!listContainer) {
       listContainer = document.createElement('div');
       listContainer.className = 'suggestions-list';
       searchSuggestions.appendChild(listContainer);
    }

    if (products.length === 0) {
      listContainer.innerHTML = '<div class="suggestion-item" style="padding:12px;">No products found</div>';
    } else {
      listContainer.innerHTML = products.map(product => `
        <a href="${product.url}" class="suggestion-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="width: 50px; height: 50px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #f5f5f5;">
             <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="suggestion-info">
            <span class="suggestion-title" style="display: block; font-size: 14px; font-weight: 500; color: #1A1A1A; line-height: 1.2; margin-bottom: 4px;">${product.title}</span>
            <span class="suggestion-price" style="font-size: 13px; font-weight: 600; color: #880015;">₹${product.price}</span>
          </div>
        </a>
      `).join('');
    }

    searchSuggestions.classList.add('active');
  }

  function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults?.classList.remove('active');
  }

  // ============================================
  // Wishlist
  // ============================================
  function initWishlist() {
    // Initialize wishlist button states
    updateWishlistButtons();

    // Delegate click events for wishlist buttons
    document.addEventListener('click', function(e) {
      const wishlistBtn = e.target.closest('.crimson-card__wishlist');
      if (wishlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(wishlistBtn);
      }
    });
  }

  function toggleWishlist(button) {
    const productId = button.dataset.productId;
    const productHandle = button.dataset.productHandle;
    
    const index = AonaTheme.wishlist.findIndex(item => item.id === productId);
    
    if (index > -1) {
      // Remove from wishlist
      AonaTheme.wishlist.splice(index, 1);
      button.classList.remove('active');
      showToast('Removed from wishlist');
    } else {
      // Add to wishlist
      AonaTheme.wishlist.push({ id: productId, handle: productHandle });
      button.classList.add('active');
      showToast('Added to wishlist');
    }
    
    // Save to localStorage
    localStorage.setItem('aona_wishlist', JSON.stringify(AonaTheme.wishlist));
    
    // Update wishlist count badge
    updateWishlistCount();
  }

  function updateWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.crimson-card__wishlist');
    
    wishlistBtns.forEach(btn => {
      const productId = btn.dataset.productId;
      const isWishlisted = AonaTheme.wishlist.some(item => item.id === productId);
      
      if (isWishlisted) {
        btn.classList.add('active');
      }
    });
  }

    function updateWishlistCount() {
    // FIX: Changed ID from 'wishlistCount' to 'wishlist-count' to match HTML
    const badge = document.getElementById('wishlist-count');
    if (badge) {
      badge.textContent = AonaTheme.wishlist.length;
      badge.style.display = AonaTheme.wishlist.length > 0 ? 'flex' : 'none';
    }
  }

  // ============================================
  // Quick Add to Cart
  // ============================================
  function initQuickAdd() {
    document.addEventListener('click', function(e) {
      const quickAddBtn = e.target.closest('.crimson-card__quick-add');
      if (quickAddBtn && !quickAddBtn.disabled) {
        e.preventDefault();
        e.stopPropagation();
        quickAddToCart(quickAddBtn);
      }
    });
  }

  function quickAddToCart(button) {
    const variantId = button.dataset.variantId;
    
    button.classList.add('loading');
    button.textContent = 'Adding...';
    
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    })
    .then(response => response.json())
    .then(data => {
      showToast('Added to bag!');
      updateCartCount();
      button.textContent = 'Added!';
      
      setTimeout(() => {
        button.classList.remove('loading');
        button.textContent = 'Quick Add';
      }, 1500);
    })
    .catch(error => {
      console.error('Add to cart error:', error);
      button.classList.remove('loading');
      button.textContent = 'Quick Add';
      showToast('Error adding to bag', 'error');
    });
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const badge = document.getElementById('cartCount');
        if (badge) {
          badge.textContent = cart.item_count;
          badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
        }
      });
  }

  // ============================================
  // Product Grid & Infinite Scroll
  // ============================================
  function initProductGrid() {
    // Any grid initialization
  }

  function initInfiniteScroll() {
    const trigger = document.getElementById('infiniteScrollTrigger');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!trigger && !loadMoreBtn) return;

    // Intersection Observer for infinite scroll
    if (trigger) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !AonaTheme.isLoading) {
            loadMoreProducts();
          }
        });
      }, { rootMargin: '200px' });

      observer.observe(trigger);
    }

    // Manual load more button
    loadMoreBtn?.addEventListener('click', loadMoreProducts);
  }

function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!grid || AonaTheme.isLoading) return;

    const currentPage = parseInt(grid.dataset.page) || 1;
    const totalPages = parseInt(grid.dataset.totalPages) || 1;
    
    if (currentPage >= totalPages) {
      loadMoreBtn?.parentElement?.remove();
      return;
    }

    AonaTheme.isLoading = true;
    loadMoreBtn?.classList.add('loading');

    const collection = loadMoreBtn?.dataset.collection || '';
    const productsPerPage = loadMoreBtn?.dataset.productsPerPage || 12;
    const nextPage = currentPage + 1;

    // Show loading skeletons
    showLoadingSkeletons(grid, 4);

    // Fetch next page
    fetch(`/collections/${collection}?page=${nextPage}&view=ajax`)
      .then(response => response.text())
      .then(html => {
        // Remove skeletons
        removeLoadingSkeletons(grid);
        
        // Parse and append new products
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newProducts = doc.querySelectorAll('.crimson-card');
        
        newProducts.forEach(product => {
          grid.appendChild(product);
          // NEW: Observe this specific card for mobile shadow effect
          if (window.mobileCardObserver) {
            window.mobileCardObserver.observe(product);
          }
        });

        // Update page number
        grid.dataset.page = nextPage;
        
        // NEW: Refresh Wishlist State (Fill hearts for saved items)
        updateWishlistButtons();
        
        AonaTheme.isLoading = false;
        loadMoreBtn?.classList.remove('loading');

        // Hide button if no more pages
        if (nextPage >= totalPages) {
          loadMoreBtn?.parentElement?.remove();
        }
      })
      .catch(error => {
        console.error('Load more error:', error);
        removeLoadingSkeletons(grid);
        AonaTheme.isLoading = false;
        loadMoreBtn?.classList.remove('loading');
      });
  }
  function showLoadingSkeletons(grid, count) {
    const template = document.getElementById('productSkeletonTemplate');
    if (!template) return;

    for (let i = 0; i < count; i++) {
      const skeleton = template.content.cloneNode(true);
      grid.appendChild(skeleton);
    }
  }

  function removeLoadingSkeletons(grid) {
    const skeletons = grid.querySelectorAll('.product-skeleton');
    skeletons.forEach(skeleton => skeleton.remove());
  }

  // ============================================
  // Mobile Card Shadow on Scroll
  // ============================================
// ============================================
  // Mobile Card Shadow on Scroll (Refactored)
  // ============================================
  function initMobileCardShadow() {
    if (window.innerWidth >= 768) return;

    const cards = document.querySelectorAll('.crimson-card');
    
    // Create observer and save it to window so we can add new cards later
    window.mobileCardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-50px 0px'
    });

    cards.forEach(card => window.mobileCardObserver.observe(card));
  }

  // ============================================
  // Filters
  // ============================================
  function initFilters() {
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const filterOverlay = document.getElementById('filterOverlay');
    const filterClose = document.getElementById('filterClose');
    const clearFilters = document.getElementById('clearFilters');
    const applyFilters = document.getElementById('applyFilters');

    if (!filterBtn || !filterPanel) return;

    // Open filter panel
    filterBtn.addEventListener('click', () => {
      filterPanel.classList.add('active');
      filterOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close filter panel
    function closeFilterPanel() {
      filterPanel.classList.remove('active');
      filterOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    filterClose?.addEventListener('click', closeFilterPanel);
    filterOverlay?.addEventListener('click', closeFilterPanel);

    // Toggle filters
    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    });

    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', function() {
        filterChips.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Clear all filters
    clearFilters?.addEventListener('click', () => {
      filterToggles.forEach(toggle => toggle.classList.remove('active'));
      filterChips.forEach(chip => chip.classList.remove('active'));
      filterChips[0]?.classList.add('active'); // Select "All"
      document.getElementById('priceMin').value = '0';
      document.getElementById('priceMax').value = '50000';
    });

    // Apply filters
    applyFilters?.addEventListener('click', () => {
      const activeFilters = collectActiveFilters();
      applyFiltersToGrid(activeFilters);
      closeFilterPanel();
    });
  }

  function collectActiveFilters() {
    const filters = {
      category: document.querySelector('.filter-chip.active')?.dataset.filter || 'all',
      materials: [],
      priceMin: parseInt(document.getElementById('priceMin')?.value) || 0,
      priceMax: parseInt(document.getElementById('priceMax')?.value) || 50000,
      options: []
    };

    // Collect active toggles
    document.querySelectorAll('.filter-toggle.active').forEach(toggle => {
      const filter = toggle.dataset.filter;
      if (['brass', 'resin', 'bronze', 'marble'].includes(filter)) {
        filters.materials.push(filter);
      } else {
        filters.options.push(filter);
      }
    });

    return filters;
  }

  function applyFiltersToGrid(filters) {
    // Build URL with filters
    const params = new URLSearchParams();
    
    if (filters.category !== 'all') {
      params.set('filter.p.tag', filters.category);
    }
    
    if (filters.materials.length > 0) {
      filters.materials.forEach(m => params.append('filter.p.tag', m));
    }
    
    params.set('filter.v.price.gte', filters.priceMin);
    params.set('filter.v.price.lte', filters.priceMax);

    // Reload page with filters
    window.location.search = params.toString();
  }

  // ============================================
  // Toast Notifications
  // ============================================
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    existingToast?.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('active'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Make toast globally accessible
  window.showToast = showToast;

  // ============================================
  // Utility Functions
  // ============================================
  function formatMoney(cents) {
    return '₹' + (cents / 100).toLocaleString('en-IN');
  }

  // ============================================
  // Flash Sale Timer
  // ============================================
  function initFlashSaleTimer() {
    const timerElements = document.querySelectorAll('.flash-timer');
    
    timerElements.forEach(timer => {
      const endTime = timer.dataset.endTime;
      if (!endTime) return;

      const endDate = new Date(endTime).getTime();

      function updateTimer() {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
          timer.innerHTML = '<span>Sale Ended</span>';
          return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timer.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
        timer.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        timer.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');
      }

      updateTimer();
      setInterval(updateTimer, 1000);
    });
  }

  // Init flash sale timer
  document.addEventListener('DOMContentLoaded', initFlashSaleTimer);

  // ============================================
  // Image Gallery (PDP)
  // ============================================
  function initProductGallery() {
    const gallery = document.querySelector('.product-gallery');
    if (!gallery) return;

    const slides = gallery.querySelectorAll('.product-gallery__slide');
    const dots = gallery.querySelectorAll('.product-gallery__dot');
    let currentSlide = 0;

    function goToSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentSlide = index;
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    gallery.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });

    gallery.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < slides.length - 1) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
      }
    }

    // Dot click
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
  }

  document.addEventListener('DOMContentLoaded', initProductGallery);

  // ============================================
  // Pincode Checker
  // ============================================
  function initPincodeChecker() {
    const form = document.getElementById('pincodeForm');
    const input = document.getElementById('pincodeInput');
    const result = document.getElementById('pincodeResult');

    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const pincode = input.value.trim();

      if (pincode.length !== 6) {
        result.innerHTML = '<span class="error">Please enter a valid 6-digit pincode</span>';
        return;
      }

      result.innerHTML = '<span class="loading">Checking...</span>';

      // Simulate API call
      setTimeout(() => {
        if (['110001', '110002', '110003', '400001', '400002', '560001'].includes(pincode)) {
          result.innerHTML = `
            <span class="success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Delivery available! Get it by <strong>Tomorrow</strong>
            </span>
          `;
        } else {
          result.innerHTML = `
            <span class="warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Delivery in 3-5 business days
            </span>
          `;
        }
      }, 800);
    });
  }

  document.addEventListener('DOMContentLoaded', initPincodeChecker);

  // Export for global access
  window.AonaTheme = AonaTheme;

})();
// --- FIX FOR LOGIN DRAWER ---
window.openLoginDrawer = function() {
  const drawer = document.querySelector('#login-drawer');
  if (drawer) {
    drawer.setAttribute('aria-hidden', 'false');
    drawer.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
  } else {
    window.location.href = '/account/login';
  }
};

// Close drawer logic
document.addEventListener('DOMContentLoaded', function() {
  const closeBtns = document.querySelectorAll('[data-close-drawer]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const drawer = document.getElementById('login-drawer');
      if(drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        drawer.style.visibility = 'hidden';
        document.body.style.overflow = '';
      }
    });
  });
});
// --- QUICK ADD TO CART LOGIC ---
async function quickAddToCart(btn) {
  const variantId = btn.previousElementSibling.value; // Gets ID from hidden input
  const originalText = btn.innerText;
  
  // 1. Show Loading State
  btn.innerText = "Adding...";
  btn.disabled = true;

  try {
    // 2. Send to Shopify Cart
    const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: variantId, quantity: 1 }]
      })
    });

    if (response.ok) {
      // 3. Success Feedback
      btn.innerText = "Added ✓";
      btn.style.backgroundColor = "#2e7d32"; // Green
      btn.style.color = "white";
      
      // Update Cart Count (Reload or Update Badge)
      setTimeout(() => {
        window.location.reload(); // Simple refresh to update cart drawer
      }, 500);
    } else {
      throw new Error('Out of stock');
    }
  } catch (error) {
    btn.innerText = "Failed";
    btn.style.backgroundColor = "red";
    setTimeout(() => {
      btn.innerText = originalText;
      btn.disabled = false;
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }, 2000);
  }
}
// --- FIX: Login Drawer Logic ---
window.openLoginDrawer = function() {
  const drawer = document.getElementById('login-drawer');
  if (drawer) {
    drawer.setAttribute('aria-hidden', 'false');
    drawer.style.visibility = 'visible'; 
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  } else {
    // Fallback if drawer doesn't exist
    window.location.href = '/account/login';
  }
};

// --- FIX: Close Drawer Logic ---
document.addEventListener('DOMContentLoaded', function() {
  // Close button click
  const closeBtns = document.querySelectorAll('[data-close-drawer], .login-drawer__close, .login-drawer__overlay');
  
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const drawer = document.getElementById('login-drawer');
      if (drawer) {
        drawer.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            drawer.style.visibility = 'hidden';
        }, 300); // Wait for slide animation
        document.body.style.overflow = '';
      }
    });
  });
});

// --- FIX: Quick Add Button ---
async function quickAddToCart(btn) {
  const variantId = btn.getAttribute('data-variant-id') || btn.previousElementSibling.value;
  const originalText = btn.innerHTML;
  
  btn.innerHTML = "Adding...";
  btn.disabled = true;

  try {
    const response = await fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    });

    if (response.ok) {
      btn.innerHTML = "Added ✓";
      btn.style.background = "#2e7d32";
      btn.style.color = "white";
      // Refresh page to update cart bubble
      setTimeout(() => window.location.reload(), 800);
    } else {
      throw new Error('Stock error');
    }
  } catch (error) {
    btn.innerHTML = "Failed";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      btn.style.background = "";
      btn.style.color = "";
    }, 2000);
  }
}