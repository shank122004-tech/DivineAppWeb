// ==============================
// DIVINE COSMIC UNIVERSE - Amazon-Style Products Edition
// GitHub Hosted GLB Models System
// ==============================

// Divine Configuration
const DIVINE_CONFIG = {
    DB_NAME: 'DivineCosmosDB',
    DB_VERSION: 2,
    STORE_NAME: 'divine_models',
    SECURITY_SIGNATURE: "DM-9937-COSMIC-SECURE",
    // GitHub Configuration
    GITHUB_USERNAME: "shank122004-tech",
    GITHUB_REPO: "DivineAppWeb",
    MODELS_JSON_URL: "https://shank122004-tech.github.io/DivineAppWeb/models.json",
    
    // Auto-Refresh Settings
    POLL_INTERVAL_MS: 60000, // 60 seconds
    RETRY_DELAY_MS: 10000,   // 10 seconds for retry
    CHECK_ON_FOCUS: true,    // Check when tab gains focus
    CHECK_ON_VISIBILITY: true, // Check when page becomes visible
    
    // Cache Settings
    CACHE_DURATION: 300000,  // 5 minutes
    ENABLE_CONDITIONAL_REQUESTS: true,
    
    // Mobile settings
    MOBILE_BREAKPOINT: 768,
    PARTICLE_COUNT: 150,
    
    // Amazon-style product settings
    PRODUCTS_PER_ROW: 4,
    MAX_PRODUCTS: 100,
    
    // Default models for first-time visitors
    DEFAULT_MODELS: []
};

// Global State
let divineDB = null;
let isMobile = false;
let allProducts = [];
let filteredProducts = [];

// Auto-Refresh State
let refreshState = {
    lastETag: null,
    lastModified: null,
    lastChecked: null,
    nextCheck: null,
    isChecking: false,
    checkInterval: null,
    productsCache: null,
    cacheTimestamp: null
};

// DOM Elements Cache
let elements = {};

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Divine Cosmos Initializing...');
    
    try {
        // Show loading overlay
        showLoading(true);
        
        // Cache DOM elements
        cacheElements();
        
        // Detect mobile
        detectMobile();
        
        // Initialize everything
        await initializeDivineCosmos();
        setupEventListeners();
        initCosmicEffects();
        animateCounters();
        setupScrollAnimations();
        
        // Load initial products with auto-refresh
        await initializeAutoRefresh();
        
        // Hide loading overlay
        setTimeout(() => {
            showLoading(false);
            showNotification('🌟 Divine Products Ready - Auto-Refresh Active', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Cosmic initialization failed:', error);
        showNotification('Failed to initialize cosmos', 'error');
        showLoading(false);
    }
});

function cacheElements() {
    elements = {
        // Main Website
        mainWebsite: document.getElementById('mainWebsite'),
        exploreBtn: document.querySelector('.explore-btn'),
        
        // Modals
        modelPreviewModal: document.getElementById('modelPreviewModal'),
        
        // Product Grids
        productsGrid: document.getElementById('productsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        
        // Auto-Refresh Elements
        refreshStatus: document.getElementById('refreshStatus'),
        refreshIndicator: document.getElementById('refreshIndicator'),
        manualRefreshBtn: document.getElementById('manualRefreshBtn'),
        retryLoadBtn: document.getElementById('retryLoadBtn'),
        lastChecked: document.getElementById('lastChecked'),
        nextCheck: document.getElementById('nextCheck'),
        loadInfo: document.getElementById('loadInfo'),
        productsCount: document.getElementById('productsCount'),
        liveModelCount: document.getElementById('liveModelCount'),
        totalProducts: document.getElementById('totalProducts'),
        
        // Search and Filter
        searchProducts: document.getElementById('searchProducts'),
        filterTags: document.querySelectorAll('.filter-tag'),
        
        // Model Preview
        previewModelName: document.getElementById('previewModelName'),
        modelViewer: document.getElementById('modelViewer'),
        previewModelSource: document.getElementById('previewModelSource'),
        previewModelUrl: document.getElementById('previewModelUrl'),
        previewModelDate: document.getElementById('previewModelDate'),
        previewModelTags: document.getElementById('previewModelTags'),
        previewModelDesc: document.getElementById('previewModelDesc'),
        directDownloadLink: document.getElementById('directDownloadLink'),
        closePreviewBtn: document.querySelector('.close-preview-btn'),
        
        // Close Buttons
        closeModalBtns: document.querySelectorAll('.close-modal, .divine-close'),
        
        // Statistics
        totalDownloads: document.getElementById('totalDownloads'),
        todayDownloads: document.getElementById('todayDownloads')
    };
}

function detectMobile() {
    isMobile = window.innerWidth < DIVINE_CONFIG.MOBILE_BREAKPOINT;
    document.body.classList.toggle('mobile-device', isMobile);
}

async function initializeDivineCosmos() {
    await initDivineDB();
}

// ==============================
// AUTO-REFRESH SYSTEM
// ==============================

async function initializeAutoRefresh() {
    console.log('🔄 Initializing auto-refresh system...');
    
    // Update status display
    updateRefreshStatus('Initializing...');
    
    // Load initial products
    await loadProductsFromGitHub();
    
    // Start periodic checking
    startAutoRefresh();
    
    // Set up focus/visibility checks
    if (DIVINE_CONFIG.CHECK_ON_FOCUS) {
        window.addEventListener('focus', handleFocusCheck);
    }
    
    if (DIVINE_CONFIG.CHECK_ON_VISIBILITY) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
}

async function loadProductsFromGitHub(forceRefresh = false) {
    if (refreshState.isChecking && !forceRefresh) {
        console.log('⚠️ Already checking for updates, skipping...');
        return;
    }
    
    try {
        refreshState.isChecking = true;
        showRefreshIndicator(true);
        
        const now = new Date();
        refreshState.lastChecked = now;
        
        // Update last checked display
        if (elements.lastChecked) {
            elements.lastChecked.textContent = formatTimeAgo(now);
        }
        
        // Prepare fetch options with conditional requests
        const fetchOptions = {
            method: 'GET',
            headers: {},
            cache: 'no-cache'
        };
        
        // Add conditional request headers if we have them
        if (DIVINE_CONFIG.ENABLE_CONDITIONAL_REQUESTS) {
            if (refreshState.lastETag) {
                fetchOptions.headers['If-None-Match'] = refreshState.lastETag;
            }
            if (refreshState.lastModified) {
                fetchOptions.headers['If-Modified-Since'] = refreshState.lastModified;
            }
        }
        
        // Determine fetch URL
        let fetchUrl;
        if (!DIVINE_CONFIG.ENABLE_CONDITIONAL_REQUESTS || !refreshState.lastETag) {
            const url = new URL(DIVINE_CONFIG.MODELS_JSON_URL);
            url.searchParams.set('_', Date.now());
            fetchUrl = url.toString();
        } else {
            fetchUrl = DIVINE_CONFIG.MODELS_JSON_URL;
        }
        
        console.log('🌐 Fetching products from:', fetchUrl);
        
        const response = await fetch(fetchUrl, fetchOptions);
        
        // Handle 304 Not Modified (no changes)
        if (response.status === 304) {
            console.log('✅ No changes detected (304)');
            showNotification('Products are up to date', 'info');
            
            // Update cache timestamp
            refreshState.cacheTimestamp = Date.now();
            updateNextCheckTime();
            
            return false;
        }
        
        // Handle 200 OK (new data)
        if (response.ok) {
            const products = await response.json();
            
            // Save ETag and Last-Modified for next request
            const etag = response.headers.get('ETag');
            const lastModified = response.headers.get('Last-Modified');
            
            if (etag) refreshState.lastETag = etag;
            if (lastModified) refreshState.lastModified = lastModified;
            
            console.log(`✅ Loaded ${products.length} products from GitHub`);
            
            // Process and render products
            await processAndRenderProducts(products);
            
            // Update cache
            refreshState.productsCache = products;
            refreshState.cacheTimestamp = Date.now();
            
            // Cache products to IndexedDB
            await cacheProductsToDB(products);
            
            // Show success notification
            showNotification(`${products.length} Amazon-style products loaded`, 'success');
            
            updateNextCheckTime();
            return true;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to load products:', error);
        
        // Try to use cache if available
        if (refreshState.productsCache && refreshState.cacheTimestamp) {
            const cacheAge = Date.now() - refreshState.cacheTimestamp;
            if (cacheAge < DIVINE_CONFIG.CACHE_DURATION) {
                console.log('🔄 Using cached products...');
                await processAndRenderProducts(refreshState.productsCache);
                showNotification('Using cached products (offline mode)', 'warning');
                return false;
            }
        }
        
        // Try to load from IndexedDB as fallback
        const cachedProducts = await getCachedProductsFromDB();
        if (cachedProducts && cachedProducts.length > 0) {
            console.log('💾 Loading products from database cache...');
            await processAndRenderProducts(cachedProducts);
            showNotification('Using offline database cache', 'warning');
            return false;
        }
        
        // Show error notification
        showNotification(`Failed to load products: ${error.message}`, 'error');
        
        // Show empty state with retry button
        if (elements.emptyState) {
            elements.emptyState.style.display = 'block';
        }
        
        if (elements.productsGrid) {
            elements.productsGrid.innerHTML = '';
        }
        
        return false;
        
    } finally {
        refreshState.isChecking = false;
        showRefreshIndicator(false);
        
        // Update next check time
        updateNextCheckTime();
    }
}

async function processAndRenderProducts(products) {
    if (!products || !Array.isArray(products)) {
        console.error('Invalid products data:', products);
        return;
    }
    
    // Normalize and validate products
    const normalizedProducts = products.map(normalizeProduct).filter(product => {
        // Basic validation
        return product && product.name && product.glbUrl;
    });
    
    console.log(`🔄 Processing ${normalizedProducts.length} valid products...`);
    
    // Update product count
    updateProductCount(normalizedProducts.length);
    
    // Update global state
    allProducts = normalizedProducts;
    filteredProducts = [...allProducts];
    
    // Render products in Amazon-style boxes
    renderAmazonProducts(allProducts, elements.productsGrid);
    
    // Update UI state
    if (elements.emptyState) {
        elements.emptyState.style.display = normalizedProducts.length === 0 ? 'block' : 'none';
    }
    
    if (elements.loadingSpinner) {
        elements.loadingSpinner.style.display = 'none';
    }
    
    // Animate new products if they exist
    animateNewProducts();
}

function normalizeProduct(product) {
    // Ensure consistent field names
    const normalized = { ...product };
    
    // Normalize GLB URL
    if (product.glbUrl) {
        normalized.glbUrl = product.glbUrl;
    } else if (product.src) {
        normalized.glbUrl = product.src;
    } else if (product.url) {
        normalized.glbUrl = product.url;
    } else if (product.downloadUrl) {
        normalized.glbUrl = product.downloadUrl;
    }
    
    // Normalize thumbnail URL
    if (product.thumbnailUrl) {
        normalized.thumbnailUrl = product.thumbnailUrl;
    } else if (product.thumbnail) {
        normalized.thumbnailUrl = product.thumbnail;
    } else if (product.image) {
        normalized.thumbnailUrl = product.image;
    } else if (product.imageUrl) {
        normalized.thumbnailUrl = product.imageUrl;
    } else {
        // Default thumbnail based on name
        normalized.thumbnailUrl = getDefaultThumbnail(product.name);
    }
    
    // Ensure fileName
    if (!normalized.fileName && normalized.glbUrl) {
        normalized.fileName = normalized.glbUrl.split('/').pop() || 
                             `${product.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
    }
    
    // Ensure tags array
    if (!normalized.tags || !Array.isArray(normalized.tags)) {
        normalized.tags = ['divine', 'sacred'];
    } else {
        // Add divine tag if not present
        if (!normalized.tags.includes('divine')) {
            normalized.tags.push('divine');
        }
    }
    
    // Ensure source
    if (!normalized.source) {
        normalized.source = 'github';
    }
    
    // Ensure uploadDate
    if (!normalized.uploadDate) {
        normalized.uploadDate = new Date().toISOString();
    }
    
    // Ensure description
    if (!normalized.description) {
        normalized.description = `Divine 3D model: ${product.name}`;
    }
    
    // Ensure price (free for all)
    if (!normalized.price) {
        normalized.price = 0;
    }
    
    // Ensure fileSize
    if (!normalized.fileSize) {
        normalized.fileSize = Math.floor(Math.random() * 5000000) + 1000000; // 1-5MB random
    }
    
    // Generate unique ID if not present
    if (!normalized.id) {
        normalized.id = 'github_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Ensure rating for Amazon-style look
    if (!normalized.rating) {
        normalized.rating = (Math.random() * 2 + 3).toFixed(1); // 3-5 stars
    }
    
    // Ensure download count
    if (!normalized.downloadCount) {
        normalized.downloadCount = Math.floor(Math.random() * 1000);
    }
    
    return normalized;
}

function startAutoRefresh() {
    // Clear any existing interval
    if (refreshState.checkInterval) {
        clearInterval(refreshState.checkInterval);
    }
    
    // Start new interval
    refreshState.checkInterval = setInterval(async () => {
        console.log('🔄 Auto-refresh check...');
        await loadProductsFromGitHub();
    }, DIVINE_CONFIG.POLL_INTERVAL_MS);
    
    console.log(`✅ Auto-refresh started (${DIVINE_CONFIG.POLL_INTERVAL_MS / 1000}s interval)`);
    updateNextCheckTime();
}

function updateNextCheckTime() {
    if (!refreshState.lastChecked) return;
    
    const nextCheck = new Date(refreshState.lastChecked.getTime() + DIVINE_CONFIG.POLL_INTERVAL_MS);
    refreshState.nextCheck = nextCheck;
    
    if (elements.nextCheck) {
        const secondsLeft = Math.floor((nextCheck - new Date()) / 1000);
        if (secondsLeft > 0) {
            elements.nextCheck.textContent = `${secondsLeft}s`;
        } else {
            elements.nextCheck.textContent = 'Soon';
        }
    }
}

function updateRefreshStatus(status) {
    if (elements.refreshStatus) {
        const statusText = elements.refreshStatus.querySelector('span');
        if (statusText) {
            statusText.textContent = status;
        }
    }
}

function showRefreshIndicator(show) {
    if (elements.refreshIndicator) {
        if (show) {
            elements.refreshIndicator.classList.add('active');
        } else {
            elements.refreshIndicator.classList.remove('active');
        }
    }
}

function handleFocusCheck() {
    console.log('🔄 Tab focused, checking for updates...');
    loadProductsFromGitHub();
}

function handleVisibilityChange() {
    if (!document.hidden) {
        console.log('🔄 Page visible, checking for updates...');
        loadProductsFromGitHub();
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffSec < 3600) {
        const min = Math.floor(diffSec / 60);
        return `${min} minute${min !== 1 ? 's' : ''} ago`;
    } else if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// ==============================
// AMAZON-STYLE PRODUCT RENDERING
// ==============================

function renderAmazonProducts(products, container) {
    if (!container) return;
    
    // Store current scroll position if we're updating
    const wasScrolled = container.scrollTop > 0;
    const scrollPos = container.scrollTop;
    
    container.innerHTML = '';
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="cosmic-empty">
                <div class="empty-orb">
                    <i class="fas fa-cloud"></i>
                </div>
                <h3>No Divine Products Found</h3>
                <p>Add GLB models to GitHub repository to see them here</p>
            </div>
        `;
        return;
    }
    
    // Limit to max products
    const displayProducts = products.slice(0, DIVINE_CONFIG.MAX_PRODUCTS);
    
    displayProducts.forEach((product, index) => {
        const card = createAmazonProductCard(product);
        card.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(card);
    });
    
    // Restore scroll position
    if (wasScrolled) {
        container.scrollTop = scrollPos;
    }
}

function createAmazonProductCard(product) {
    const card = document.createElement('div');
    card.className = 'amazon-product-card animate-on-scroll';
    card.dataset.id = product.id;
    card.dataset.source = product.source;
    card.dataset.tags = product.tags ? product.tags.join(',') : '';
    
    // Normalize product data
    const normalizedProduct = normalizeProduct(product);
    const thumbnailSrc = normalizedProduct.thumbnailUrl;
    const glbUrl = normalizedProduct.glbUrl;
    
    // Product badge
    const productBadge = '<div class="product-badge"><i class="fab fa-github"></i> GitHub</div>';
    
    // Tags
    const tags = product.tags || ['divine', 'sacred'];
    const tagsHtml = tags.slice(0, 3).map(tag => 
        `<span class="product-tag">${tag}</span>`
    ).join('');
    
    // File size
    const fileSize = product.fileSize ? formatFileSize(product.fileSize) : '1-5 MB';
    const uploadDate = new Date(product.uploadDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Rating stars
    const rating = product.rating || 4.5;
    const starsHtml = generateRatingStars(rating);
    
    // Download count
    const downloadCount = product.downloadCount || Math.floor(Math.random() * 1000);
    
    // URL display (truncated)
    const displayUrl = truncateUrl(glbUrl, 50);
    
    // Check if model-viewer is available
    const hasModelViewer = typeof customElements !== 'undefined' && customElements.get('model-viewer');
    
    card.innerHTML = `
        ${productBadge}
        <div class="product-glow"></div>
        
        <div class="product-image-container">
            ${hasModelViewer && glbUrl ? `
                <model-viewer 
                    src="${glbUrl}"
                    alt="${product.name}"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    loading="lazy"
                    style="width: 100%; height: 100%;"
                    crossorigin="anonymous"
                    class="model-viewer-container">
                </model-viewer>
            ` : `
                <img src="${thumbnailSrc}" alt="${product.name}" loading="lazy" class="product-image">
            `}
        </div>
        
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            
            ${starsHtml}
            
            ${product.description ? `
                <p class="product-description">${product.description.substring(0, 120)}${product.description.length > 120 ? '...' : ''}</p>
            ` : ''}
            
            <div class="product-meta">
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${uploadDate}
                </span>
                <span class="meta-item">
                    <i class="fas fa-weight"></i>
                    ${fileSize}
                </span>
                <span class="meta-item">
                    <i class="fas fa-download"></i>
                    ${downloadCount.toLocaleString()}
                </span>
            </div>
            
            <div class="product-url" title="${glbUrl}">
                <i class="fas fa-link"></i>
                <span class="url-text">${displayUrl}</span>
            </div>
            
            <div class="product-tags">
                ${tagsHtml}
            </div>
        </div>
        
        <div class="product-actions">
            <button class="preview-product-btn" data-id="${product.id}">
                <i class="fas fa-eye"></i>
                Preview
            </button>
            <button class="amazon-download-btn" data-id="${product.id}">
                <i class="fas fa-download"></i>
                Download GLB
            </button>
        </div>
    `;
    
    // Add event listeners
    const previewBtn = card.querySelector('.preview-product-btn');
    const downloadBtn = card.querySelector('.amazon-download-btn');
    const modelViewer = card.querySelector('model-viewer');
    const urlElement = card.querySelector('.product-url');
    
    previewBtn.addEventListener('click', () => previewProduct(product));
    downloadBtn.addEventListener('click', () => downloadProduct(product));
    
    // Click URL to copy
    if (urlElement) {
        urlElement.addEventListener('click', (e) => {
            e.preventDefault();
            copyToClipboard(glbUrl);
        });
    }
    
    // Handle model-viewer errors
    if (modelViewer) {
        modelViewer.addEventListener('error', (e) => {
            console.error('Model viewer error:', e);
            // Fallback to image
            const img = document.createElement('img');
            img.src = thumbnailSrc;
            img.alt = product.name;
            img.className = 'product-image';
            modelViewer.parentNode.replaceChild(img, modelViewer);
        });
    }
    
    return card;
}

function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '<div class="rating-stars">';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    starsHtml += ` <span style="margin-left: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">${rating}</span>`;
    starsHtml += '</div>';
    
    return starsHtml;
}

function animateNewProducts() {
    // Add animation class to new products
    const newCards = elements.productsGrid.querySelectorAll('.amazon-product-card');
    newCards.forEach(card => {
        card.classList.add('fade-in-up');
        
        // Add pulse animation for newly added products
        if (!card.dataset.animated) {
            card.dataset.animated = 'true';
            card.classList.add('new-product');
        }
    });
}

// ==============================
// PRODUCT PREVIEW & DOWNLOAD
// ==============================

function previewProduct(product) {
    if (!product.glbUrl) {
        showNotification('No GLB URL available for preview', 'error');
        return;
    }
    
    // Update preview modal
    elements.previewModelName.textContent = product.name;
    elements.modelViewer.src = product.glbUrl;
    elements.previewModelSource.textContent = 'GitHub Repository';
    elements.previewModelUrl.textContent = product.glbUrl;
    elements.previewModelDate.textContent = new Date(product.uploadDate).toLocaleDateString();
    elements.previewModelTags.textContent = product.tags ? product.tags.join(', ') : 'No tags';
    elements.previewModelDesc.textContent = product.description || 'No description available';
    
    // Set download link
    elements.directDownloadLink.href = convertToRawGithubUrl(product.glbUrl);
    elements.directDownloadLink.download = product.fileName || `${product.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
    
    // Show modal
    elements.modelPreviewModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function downloadProduct(product) {
    try {
        showNotification('Starting download...', 'warning');
        
        if (!product.glbUrl) {
            throw new Error('No download URL available');
        }
        
        // For GitHub URLs, ensure we have the raw URL
        let downloadUrl = product.glbUrl;
        if (product.source === 'github') {
            downloadUrl = convertToRawGithubUrl(downloadUrl);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = product.fileName || `${product.name.replace(/\s+/g, '_').toLowerCase()}.glb`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count
        await updateDownloadCount(product.id);
        
        showNotification('Download started! Check your downloads folder.', 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showNotification(`Download failed: ${error.message}`, 'error');
    }
}

function convertToRawGithubUrl(url) {
    try {
        const urlObj = new URL(url);
        
        // Handle GitHub Pages URL
        if (urlObj.hostname.endsWith('.github.io')) {
            const hostParts = urlObj.hostname.split('.');
            const username = hostParts[0];
            
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            const repo = pathParts[0] || DIVINE_CONFIG.GITHUB_REPO;
            const filePath = pathParts.slice(1).join('/') || '';
            
            return `https://raw.githubusercontent.com/${username}/${repo}/main/${filePath}`;
        }
        
        // Handle GitHub blob URL
        if (urlObj.hostname === 'github.com' && urlObj.pathname.includes('/blob/')) {
            const path = urlObj.pathname.replace('/blob/', '/');
            return `https://raw.githubusercontent.com${path}`;
        }
        
        // Already a raw URL
        if (urlObj.hostname === 'raw.githubusercontent.com') {
            return url;
        }
        
        return url;
    } catch (error) {
        console.error('URL conversion error:', error);
        return url;
    }
}

// ==============================
// DATABASE FUNCTIONS
// ==============================

function initDivineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DIVINE_CONFIG.DB_NAME, DIVINE_CONFIG.DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            divineDB = request.result;
            console.log('✅ Divine Database initialized');
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains(DIVINE_CONFIG.STORE_NAME)) {
                const store = db.createObjectStore(DIVINE_CONFIG.STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('source', 'source', { unique: false });
                store.createIndex('uploadDate', 'uploadDate', { unique: false });
                store.createIndex('tags', 'tags', { multiEntry: true });
                
                console.log('✅ Created object store:', DIVINE_CONFIG.STORE_NAME);
            }
        };
        
        request.onblocked = () => {
            console.warn('IndexedDB open blocked; close other tabs using site.');
        };
    });
}

async function cacheProductsToDB(products) {
    if (!divineDB) return;
    
    return new Promise((resolve, reject) => {
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        
        // Clear existing data
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
            console.log('💾 Clearing old cache...');
            
            // Add all products
            let completed = 0;
            const total = products.length;
            
            products.forEach(product => {
                const addRequest = store.add(product);
                addRequest.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        console.log(`✅ Cached ${total} products to database`);
                        resolve();
                    }
                };
                addRequest.onerror = (e) => {
                    console.error('Failed to cache product:', e);
                    reject(e);
                };
            });
        };
        
        clearRequest.onerror = (e) => {
            console.error('Failed to clear cache:', e);
            reject(e);
        };
    });
}

async function getCachedProductsFromDB() {
    if (!divineDB) return [];
    
    return new Promise((resolve, reject) => {
        const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readonly');
        const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            console.log(`💾 Retrieved ${request.result.length} products from database cache`);
            resolve(request.result);
        };
        
        request.onerror = (e) => {
            console.error('Failed to get cached products:', e);
            reject(e);
        };
    });
}

// ==============================
// DOWNLOAD COUNT MANAGEMENT
// ==============================

async function updateDownloadCount(productId) {
    try {
        // Update download count in localStorage
        let downloadStats = JSON.parse(localStorage.getItem('divine_download_stats') || '{}');
        
        // Initialize if not exists
        if (!downloadStats.total) downloadStats.total = 0;
        if (!downloadStats.daily) downloadStats.daily = {};
        
        // Update totals
        downloadStats.total = (downloadStats.total || 0) + 1;
        downloadStats[productId] = (downloadStats[productId] || 0) + 1;
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        downloadStats.daily[today] = (downloadStats.daily[today] || 0) + 1;
        
        // Save to localStorage
        localStorage.setItem('divine_download_stats', JSON.stringify(downloadStats));
        
        // Update UI counters
        updateDownloadCounters(downloadStats);
        
    } catch (error) {
        console.error('Failed to update download count:', error);
    }
}

function updateDownloadCounters(stats) {
    // Update total downloads
    if (elements.totalDownloads) {
        elements.totalDownloads.textContent = stats.total || 0;
    }
    
    // Update today's downloads
    if (elements.todayDownloads) {
        const today = new Date().toISOString().split('T')[0];
        elements.todayDownloads.textContent = stats.daily?.[today] || 0;
    }
}

function updateProductCount(count) {
    // Update all counters
    if (elements.liveModelCount) {
        elements.liveModelCount.textContent = count;
    }
    
    if (elements.productsCount) {
        elements.productsCount.textContent = count;
    }
    
    if (elements.totalProducts) {
        elements.totalProducts.textContent = count;
    }
    
    // Animate the counter
    const counters = document.querySelectorAll('.cosmic-count[data-count="0"]');
    counters.forEach(counter => {
        counter.dataset.count = count;
        counter.textContent = count;
    });
}

// ==============================
// UI HELPERS
// ==============================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-times-circle' :
                 type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after timeout
    const timeout = isMobile ? 4000 : 5000;
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, timeout);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function formatFileSize(bytes) {
    if (bytes === 0 || !bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function truncateUrl(url, maxLength) {
    if (!url || url.length <= maxLength) return url || '';
    
    const start = url.substring(0, Math.floor(maxLength / 2) - 3);
    const end = url.substring(url.length - Math.floor(maxLength / 2) + 3);
    return start + '...' + end;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('URL copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('URL copied to clipboard!', 'success');
    }
}

function getDefaultThumbnail(modelName) {
    const thumbnails = {
        'krishna': 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
        'buddha': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        'mandala': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        'lotus': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'shiva': 'https://images.unsplash.com/photo-1604617880299-c9c2f8a8f8b5?w=400&h=300&fit=crop',
        'hanuman': 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop',
        'ganesha': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'meditation': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        'statue': 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&h=300&fit=crop',
        'symbol': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
        'sacred': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    };
    
    const lowerName = (modelName || '').toLowerCase();
    for (const [key, thumbnail] of Object.entries(thumbnails)) {
        if (lowerName.includes(key)) {
            return thumbnail;
        }
    }
    
    // Default cosmic thumbnail
    return 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop';
}

// ==============================
// EVENT LISTENERS
// ==============================

function setupEventListeners() {
    // Explore Button
    if (elements.exploreBtn) {
        elements.exploreBtn.addEventListener('click', () => {
            document.getElementById('productsSection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Manual Refresh Button
    if (elements.manualRefreshBtn) {
        elements.manualRefreshBtn.addEventListener('click', async () => {
            showNotification('Checking for updates...', 'info');
            await loadProductsFromGitHub(true);
        });
    }
    
    // Retry Load Button
    if (elements.retryLoadBtn) {
        elements.retryLoadBtn.addEventListener('click', async () => {
            showNotification('Retrying to load products...', 'info');
            await loadProductsFromGitHub(true);
        });
    }
    
    // Close Modals
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.modelPreviewModal) {
            closeModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Product Search
    if (elements.searchProducts) {
        elements.searchProducts.addEventListener('input', (e) => {
            filterProducts(e.target.value);
        });
    }
    
    // Filter Tags
    elements.filterTags.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterTags.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProductsByTag(btn.dataset.tag);
        });
    });
    
    // Preview Modal Close
    if (elements.closePreviewBtn) {
        elements.closePreviewBtn.addEventListener('click', () => {
            elements.modelPreviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Window resize
    window.addEventListener('resize', () => {
        detectMobile();
    });
    
    // Scroll animations
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function closeModal() {
    elements.modelPreviewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ==============================
// FILTERING & SEARCH
// ==============================

function filterProducts(searchTerm = '') {
    filteredProducts = allProducts.filter(product => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.tags && product.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.glbUrl && product.glbUrl.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesSearch;
    });
    
    renderAmazonProducts(filteredProducts, elements.productsGrid);
}

function filterProductsByTag(tag) {
    if (tag === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.tags && product.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }
    
    renderAmazonProducts(filteredProducts, elements.productsGrid);
}

// ==============================
// ANIMATIONS & EFFECTS
// ==============================

function initCosmicEffects() {
    initDivineParticles();
    
    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .model-viewer-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
            color: white;
            flex-direction: column;
            gap: 10px;
            padding: 20px;
        }
        
        .model-viewer-fallback i {
            font-size: 2rem;
            color: #ff6b6b;
        }
    `;
    document.head.appendChild(style);
}

let particlesAnimationId = null;
let resizeHandler = null;

function initDivineParticles() {
    const canvas = document.getElementById('divineCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Cancel existing animation if any
    if (particlesAnimationId) {
        cancelAnimationFrame(particlesAnimationId);
    }
    
    // Remove existing resize handler
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
    }
    
    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    
    const particles = [];
    const particleCount = isMobile ? 
        DIVINE_CONFIG.PARTICLE_COUNT / 2 : 
        DIVINE_CONFIG.PARTICLE_COUNT;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off walls
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Draw glow
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', ', 0.05)').replace('rgb', 'rgba');
            ctx.fill();
        });
        
        particlesAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    resizeHandler = () => {
        resizeCanvas();
        // Reinitialize particles on resize
        initDivineParticles();
    };
    
    window.addEventListener('resize', resizeHandler);
}

function animateCounters() {
    const counters = document.querySelectorAll('.cosmic-count[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Start animation when counter is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// ==============================
// EXPORT FOR DEBUGGING
// ==============================

window.DivineCosmos = {
    config: DIVINE_CONFIG,
    refreshState: () => ({ ...refreshState }),
    products: () => [...allProducts],
    filteredProducts: () => [...filteredProducts],
    isMobile: () => isMobile,
    reloadProducts: () => loadProductsFromGitHub(true),
    showNotification: showNotification,
    manualRefresh: () => loadProductsFromGitHub(true),
    getDownloadStats: () => JSON.parse(localStorage.getItem('divine_download_stats') || '{}'),
    clearCache: async () => {
        if (divineDB) {
            const transaction = divineDB.transaction([DIVINE_CONFIG.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(DIVINE_CONFIG.STORE_NAME);
            await store.clear();
            console.log('🗑️ Cache cleared');
        }
    }
};

console.log('✨ Divine Cosmos Script Loaded Successfully!');
