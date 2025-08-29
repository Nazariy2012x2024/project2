// DarkCommerce - Main JavaScript File

// Global variables
let cart = [];
let products = [];
let currentUser = null;

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const cartContent = document.getElementById('cart-content');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const featuredProducts = document.getElementById('featured-products');
const newsletterForm = document.getElementById('newsletter-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    updateCartDisplay();
});

// Initialize the application
function initializeApp() {
    console.log('🚀 DarkCommerce initializing...');
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize animations
    initializeAnimations();
}

// Setup event listeners
function setupEventListeners() {
    // Cart functionality
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Newsletter subscription
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubscription);
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('open');
        }
    });
}

// Cart functionality
function toggleCart() {
    cartSidebar.classList.toggle('open');
}

function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Product removed from cart!', 'info');
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    
    // Update cart count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart content
    if (cartContent) {
        if (cart.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cartContent.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price}</p>
                        <div class="cart-item-quantity">
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
    
    // Update cart total
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}

function saveCartToStorage() {
    localStorage.setItem('darkcommerce_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('darkcommerce_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Product functionality
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
            products = data.data.products || data.data;
            displayProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products
        loadSampleProducts();
    }
}

function loadSampleProducts() {
    products = [
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 299.99,
            description: 'High-quality wireless headphones with noise cancellation',
            category: 'Electronics',
            image: '/images/headphones.jpg',
            rating: 4.8,
            reviews: 156,
            inStock: true
        },
        {
            id: 2,
            name: 'Smart Fitness Watch',
            price: 199.99,
            description: 'Advanced fitness tracking with heart rate monitoring',
            category: 'Electronics',
            image: '/images/watch.jpg',
            rating: 4.6,
            reviews: 89,
            inStock: true
        },
        {
            id: 3,
            name: 'Designer Leather Jacket',
            price: 399.99,
            description: 'Premium leather jacket with modern design',
            category: 'Fashion',
            image: '/images/jacket.jpg',
            rating: 4.9,
            reviews: 234,
            inStock: true
        },
        {
            id: 4,
            name: 'Gaming Laptop',
            price: 1299.99,
            description: 'High-performance gaming laptop with RTX graphics',
            category: 'Electronics',
            image: '/images/laptop.jpg',
            rating: 4.7,
            reviews: 312,
            inStock: true
        }
    ];
    
    displayProducts();
}

function displayProducts() {
    if (!featuredProducts) return;
    
    featuredProducts.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <i class="fas fa-image"></i>
                <p>${product.name}</p>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span class="rating-number">${product.rating}</span>
                    <span class="reviews">(${product.reviews})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    // Filter products based on search query
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    // Display filtered products
    if (filteredProducts.length > 0) {
        featuredProducts.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <i class="fas fa-image"></i>
                    <p>${product.name}</p>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <span class="stars">
                            ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                        </span>
                        <span class="rating-number">${product.rating}</span>
                        <span class="reviews">(${product.reviews})</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        showNotification(`Found ${filteredProducts.length} products for "${query}"`, 'info');
    } else {
        featuredProducts.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search terms or browse our categories</p>
                <button class="btn btn-primary" onclick="loadProducts()">View All Products</button>
            </div>
        `;
    }
}

// Wishlist functionality
function addToWishlist(productId) {
    const wishlistCount = document.getElementById('wishlist-count');
    let currentCount = parseInt(wishlistCount.textContent) || 0;
    wishlistCount.textContent = currentCount + 1;
    
    showNotification('Product added to wishlist!', 'success');
}

// Newsletter subscription
function handleNewsletterSubscription(e) {
    e.preventDefault();
    
    const email = document.getElementById('newsletter-email').value;
    if (!email) return;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Thank you for subscribing!', 'success');
        e.target.reset();
    }, 1000);
}

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    // Simulate checkout process
    showNotification('Redirecting to checkout...', 'info');
    
    setTimeout(() => {
        // In a real app, redirect to checkout page
        showNotification('Checkout feature coming soon!', 'info');
    }, 2000);
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function checkAuthStatus() {
    // Check if user is logged in (implement with your auth system)
    const token = localStorage.getItem('darkcommerce_token');
    if (token) {
        // Validate token and set currentUser
        console.log('User is authenticated');
    }
}

function initializeAnimations() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.product-card, .section-title').forEach(el => {
        observer.observe(el);
    });
}

// Add checkout event listener
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
}

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.addToWishlist = addToWishlist;
window.proceedToCheckout = proceedToCheckout;

console.log('✅ DarkCommerce loaded successfully!');
