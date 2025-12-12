// script.js - Divine 3D Gallery + APK Download - Complete with GLB Thumbnails
'use strict';

// Configuration
const CONFIG = {
    DEFAULT_GITHUB_REPO: 'shank122004-tech/DivineAppWeb',
    DEFAULT_MODELS_PATH: 'models',
    LOCAL_STORAGE_KEY: 'divine3d_gallery_data',
    CACHE_DURATION: 15 * 60 * 1000, // 15 minutes
    
    // SECURITY: Password moved to GitHub Gist
    SECURITY_GIST_ID: '6802f00f32fdb0aec7ec3e6680a3b60b044940ff513d6e128b58dad56350206b',
    SECURITY_GIST_FILE: 'admin-config.json',
    
    // GLB Security Configuration
    GLB_SECURITY: {
        FILENAME_SIGNATURE: "@divinemantra",
        INTERNAL_SIGNATURE: "DM-9937-SECURE-CODE",
        GLB_MAGIC: 0x46546C67, // "glTF"
        CHUNK_TYPE_JSON: 0x4E4F534A, // "JSON"
        CHUNK_TYPE_BIN: 0x004E4942  // "BIN"
    }
};

// State Management
const State = {
    models: [],
    categories: new Set(),
    filteredModels: [],
    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'name-asc',
    isAdmin: false,
    isInitialized: false,
    isLoading: false,
    refreshInterval: null,
    currentPreviewModel: null,
    autoRotateEnabled: true,
    viewMode: 'grid',
    githubConfig: {
        repo: CONFIG.DEFAULT_GITHUB_REPO,
        path: CONFIG.DEFAULT_MODELS_PATH,
        jsonUrl: '',
        autoRefresh: '15'
    },
    autoSecureDownloads: true,
    autoInjectSignature: true
};

// DOM Elements
const Elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    themeToggle: document.getElementById('themeToggle'),
    apkDownloadBtn: document.getElementById('apkDownloadBtn'),
    apkModal: document.getElementById('apkModal'),
    closeApkModal: document.getElementById('closeApkModal'),
    openApkModalBtn: document.getElementById('openApkModalBtn'),
    apkDownloadLink: document.getElementById('apkDownloadLink'),
    apkSize: document.getElementById('apkSize'),
    adminBtn: document.getElementById('adminBtn'),
    adminOverlay: document.getElementById('adminOverlay'),
    refreshBtn: document.getElementById('refreshBtn'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.getElementById('navLinks'),
    mainHeader: document.querySelector('.main-header'),
    totalModels: document.getElementById('totalModels'),
    heroPreview: document.getElementById('hero-preview'),
    galleryContainer: document.getElementById('galleryContainer'),
    gallerySearch: document.getElementById('gallerySearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFilters: document.getElementById('clearFilters'),
    sortSelect: document.getElementById('sortSelect'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noResults: document.getElementById('noResults'),
    viewBtns: document.querySelectorAll('.view-btn'),
    categoriesContainer: document.getElementById('categoriesContainer'),
    previewModal: document.getElementById('previewModal'),
    closePreview: document.getElementById('closePreview'),
    previewViewer: document.getElementById('previewViewer'),
    previewTitle: document.getElementById('previewTitle'),
    previewSubtitle: document.getElementById('previewSubtitle'),
    previewName: document.getElementById('previewName'),
    previewCategory: document.getElementById('previewCategory'),
    previewSize: document.getElementById('previewSize'),
    previewDate: document.getElementById('previewDate'),
    previewDescription: document.getElementById('previewDescription'),
    previewTags: document.getElementById('previewTags'),
    downloadModel: document.getElementById('downloadModel'),
    copyUrl: document.getElementById('copyUrl'),
    shareModel: document.getElementById('shareModel'),
    rotateToggle: document.getElementById('rotateToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    arToggle: document.getElementById('arToggle'),
    resetView: document.getElementById('resetView'),
    closeAdmin: document.getElementById('closeAdmin'),
    adminLogin: document.getElementById('adminLogin'),
    adminDashboard: document.getElementById('adminDashboard'),
    adminPassword: document.getElementById('adminPassword'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminStatus: document.getElementById('adminStatus'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    githubRepo: document.getElementById('githubRepo'),
    modelsPath: document.getElementById('modelsPath'),
    jsonUrl: document.getElementById('jsonUrl'),
    autoRefresh: document.getElementById('autoRefresh'),
    defaultCategory: document.getElementById('defaultCategory'),
    testConnection: document.getElementById('testConnection'),
    importModelsBtn: document.getElementById('importModelsBtn'),
    importStatus: document.getElementById('importStatus'),
    importDetails: document.getElementById('importDetails'),
    adminModelsList: document.getElementById('adminModelsList'),
    modelsCount: document.getElementById('modelsCount'),
    exportModels: document.getElementById('exportModels'),
    clearAllModels: document.getElementById('clearAllModels'),
    autoSecure: document.getElementById('autoSecure'),
    autoSignature: document.getElementById('autoSignature'),
    resetSecurity: document.getElementById('resetSecurity'),
    backupData: document.getElementById('backupData'),
    toastContainer: document.getElementById('toastContainer'),
    fabScrollTop: document.getElementById('fabScrollTop'),
    fabImport: document.getElementById('fabImport')
};

// ============================================
// SECURE PASSWORD VERIFICATION SYSTEM
// ============================================

class SecureAuth {
    constructor() {
        this.gistId = CONFIG.SECURITY_GIST_ID;
        this.gistFile = CONFIG.SECURITY_GIST_FILE;
        this.cache = null;
        this.cacheTime = null;
    }

    async verifyPassword(password) {
        try {
            // Hash the entered password
            const inputHash = await this.sha256(password);
            
            // Get the correct hash from GitHub Gist
            const correctHash = await this.getPasswordHash();
            
            // Compare hashes
            if (inputHash === correctHash) {
                return { success: true };
            } else {
                return { 
                    success: false, 
                    error: 'Incorrect password' 
                };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return { 
                success: false, 
                error: 'Authentication failed. Please try again.' 
            };
        }
    }

    async getPasswordHash() {
        // Check cache first (cache for 5 minutes)
        if (this.cache && this.cacheTime && 
            Date.now() - this.cacheTime < 5 * 60 * 1000) {
            return this.cache;
        }

        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const gistData = await response.json();
            const config = JSON.parse(gistData.files[this.gistFile].content);
            
            // Cache the result
            this.cache = config.passwordHash;
            this.cacheTime = Date.now();
            
            return config.passwordHash;
        } catch (error) {
            console.error('Failed to fetch password hash:', error);
            
            // Fallback for development/offline
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'; // Hash of "Shashank@122004"
            }
            
            throw error;
        }
    }

    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
}

// Create global secure auth instance
const secureAuth = new SecureAuth();

// ============================================
// GLB SIGNATURE INJECTION SYSTEM
// ============================================

class GLBSignatureInjector {
    constructor() {
        this.magic = CONFIG.GLB_SECURITY.GLB_MAGIC;
        this.version = 2;
        this.signature = CONFIG.GLB_SECURITY.INTERNAL_SIGNATURE;
    }

    async injectSignature(glbData) {
        try {
            console.log('Injecting signature into GLB file...');
            
            // Convert ArrayBuffer to DataView for easier manipulation
            const dataView = new DataView(glbData);
            
            // Verify GLB magic number
            const magic = dataView.getUint32(0, true);
            if (magic !== this.magic) {
                throw new Error('Invalid GLB file: Magic number mismatch');
            }
            
            // Get GLB length
            const length = dataView.getUint32(8, true);
            
            // Parse chunks
            let offset = 12;
            let jsonChunk = null;
            let binChunk = null;
            
            for (let i = 0; i < 2; i++) {
                if (offset >= length) break;
                
                const chunkLength = dataView.getUint32(offset, true);
                const chunkType = dataView.getUint32(offset + 4, true);
                
                if (chunkType === CONFIG.GLB_SECURITY.CHUNK_TYPE_JSON) {
                    // Found JSON chunk
                    const chunkData = new Uint8Array(glbData, offset + 8, chunkLength);
                    const jsonText = new TextDecoder().decode(chunkData);
                    jsonChunk = {
                        offset: offset,
                        length: chunkLength,
                        data: chunkData,
                        json: JSON.parse(jsonText)
                    };
                } else if (chunkType === CONFIG.GLB_SECURITY.CHUNK_TYPE_BIN) {
                    // Found BIN chunk
                    binChunk = {
                        offset: offset,
                        length: chunkLength,
                        data: new Uint8Array(glbData, offset + 8, chunkLength)
                    };
                }
                
                offset += 8 + chunkLength;
            }
            
            if (!jsonChunk) {
                throw new Error('No JSON chunk found in GLB file');
            }
            
            // Inject signature into JSON metadata
            if (!jsonChunk.json.asset) {
                jsonChunk.json.asset = {};
            }
            jsonChunk.json.asset.signature = this.signature;
            jsonChunk.json.asset.generator = "Divine Mantra Processor v1.0";
            jsonChunk.json.extras = jsonChunk.json.extras || {};
            jsonChunk.json.extras.secured = true;
            jsonChunk.json.extras.securedAt = new Date().toISOString();
            jsonChunk.json.extras.securedBy = "Divine 3D Gallery";
            
            // Convert JSON back to bytes
            const newJsonStr = JSON.stringify(jsonChunk.json);
            const newJsonBytes = new TextEncoder().encode(newJsonStr);
            
            // Calculate padding for 4-byte alignment
            const jsonPadding = (4 - (newJsonBytes.length % 4)) % 4;
            const newJsonLength = newJsonBytes.length + jsonPadding;
            
            // Calculate new total length
            let newTotalLength = 12; // Header
            newTotalLength += 8 + newJsonLength; // JSON chunk
            if (binChunk) {
                const binPadding = (4 - (binChunk.data.length % 4)) % 4;
                newTotalLength += 8 + binChunk.data.length + binPadding; // BIN chunk
            }
            
            // Create new ArrayBuffer
            const newBuffer = new ArrayBuffer(newTotalLength);
            const newView = new DataView(newBuffer);
            const newBytes = new Uint8Array(newBuffer);
            
            // Write header
            newView.setUint32(0, this.magic, true); // Magic
            newView.setUint32(4, this.version, true); // Version
            newView.setUint32(8, newTotalLength, true); // Total length
            
            // Write JSON chunk header
            let writeOffset = 12;
            newView.setUint32(writeOffset, newJsonLength, true);
            newView.setUint32(writeOffset + 4, CONFIG.GLB_SECURITY.CHUNK_TYPE_JSON, true);
            
            // Write JSON chunk data
            writeOffset += 8;
            newBytes.set(newJsonBytes, writeOffset);
            writeOffset += newJsonBytes.length;
            
            // Add JSON padding
            for (let i = 0; i < jsonPadding; i++) {
                newBytes[writeOffset++] = 0x20; // Space character
            }
            
            // Write BIN chunk if exists
            if (binChunk) {
                const binPadding = (4 - (binChunk.data.length % 4)) % 4;
                const binLength = binChunk.data.length + binPadding;
                
                newView.setUint32(writeOffset, binLength, true);
                newView.setUint32(writeOffset + 4, CONFIG.GLB_SECURITY.CHUNK_TYPE_BIN, true);
                
                writeOffset += 8;
                newBytes.set(binChunk.data, writeOffset);
                writeOffset += binChunk.data.length;
                
                // Add BIN padding
                for (let i = 0; i < binPadding; i++) {
                    newBytes[writeOffset++] = 0x00;
                }
            }
            
            console.log('Signature injected successfully');
            return newBuffer;
            
        } catch (error) {
            console.error('Signature injection error:', error);
            throw new Error(`Failed to inject signature: ${error.message}`);
        }
    }

    checkHasSignature(glbData) {
        try {
            const dataView = new DataView(glbData);
            const magic = dataView.getUint32(0, true);
            if (magic !== this.magic) return false;
            
            const length = dataView.getUint32(8, true);
            let offset = 12;
            
            for (let i = 0; i < 2; i++) {
                if (offset >= length) break;
                
                const chunkLength = dataView.getUint32(offset, true);
                const chunkType = dataView.getUint32(offset + 4, true);
                
                if (chunkType === CONFIG.GLB_SECURITY.CHUNK_TYPE_JSON) {
                    const jsonChunk = new Uint8Array(glbData, offset + 8, chunkLength);
                    const jsonText = new TextDecoder().decode(jsonChunk);
                    
                    try {
                        const gltf = JSON.parse(jsonText);
                        return gltf.asset && gltf.asset.signature === this.signature;
                    } catch (e) {
                        return false;
                    }
                }
                
                offset += 8 + chunkLength;
            }
            
            return false;
        } catch (error) {
            console.warn('Signature check error:', error);
            return false;
        }
    }
}

// Create global signature injector
const signatureInjector = new GLBSignatureInjector();

// ============================================
// APK DOWNLOAD FUNCTIONS
// ============================================

async function getAPKFileSize() {
    try {
        const apkUrl = 'docs/app-debug.apk';
        const response = await fetch(apkUrl, { method: 'HEAD' });
        
        if (response.ok) {
            const size = response.headers.get('content-length');
            if (size) {
                const bytes = parseInt(size, 10);
                const kb = Math.round((bytes / 1024) * 10) / 10;
                const mb = Math.round((bytes / (1024 * 1024)) * 100) / 100;
                
                if (Elements.apkSize) {
                    Elements.apkSize.textContent = mb > 1 ? 
                        `${mb} MB` : `${kb} KB`;
                }
                
                return {
                    bytes: bytes,
                    kb: kb,
                    mb: mb,
                    formatted: mb > 1 ? `${mb} MB` : `${kb} KB`
                };
            }
        }
    } catch (error) {
        console.warn('Failed to get APK file size:', error);
    }
    
    if (Elements.apkSize) {
        Elements.apkSize.textContent = 'Size: Unknown';
    }
    return null;
}

function openApkModal() {
    if (Elements.apkModal) {
        Elements.apkModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update APK size if needed
        getAPKFileSize();
    }
}

function closeApkModal() {
    if (Elements.apkModal) {
        Elements.apkModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    try {
        showLoading(true);
        
        // Setup event listeners
        setupEventListeners();
        
        // Load saved data
        loadSavedData();
        
        // Get APK file size
        getAPKFileSize();
        
        // Load initial data
        await loadModels();
        
        // Update UI
        updateStats();
        populateCategories();
        renderModels();
        
        // Check admin status
        checkAdminStatus();
        
        State.isInitialized = true;
        
        showToast('Welcome to Divine 3D Gallery! All downloads auto-secured.', 'success');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize gallery', 'error');
        loadSampleModels();
    } finally {
        showLoading(false);
    }
}

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

async function loadModels() {
    try {
        State.isLoading = true;
        updateLoadingIndicator(true);
        
        // Try to load from GitHub
        await importFromGitHub();
        
        if (State.models.length === 0) {
            loadSampleModels();
        }
        
        updateCategories();
        saveToLocalStorage();
        filterAndSortModels();
        
        console.log(`Loaded ${State.models.length} models`);
        
    } catch (error) {
        console.error('Error loading models:', error);
        showToast(`Failed to load models: ${error.message}`, 'error');
        
        if (!loadFromLocalStorage()) {
            loadSampleModels();
        }
    } finally {
        State.isLoading = false;
        updateLoadingIndicator(false);
    }
}

async function importFromGitHub() {
    try {
        const { repo, path, jsonUrl } = State.githubConfig;
        
        if (!repo) {
            throw new Error('GitHub repository not configured');
        }
        
        let models = [];
        
        if (jsonUrl) {
            models = await loadFromJsonUrl(jsonUrl);
        } else {
            models = await scanGitHubRepository(repo, path);
        }
        
        const processedModels = await Promise.all(
            models.map(async (model, index) => {
                const processedModel = {
                    id: model.id || `github_${Date.now()}_${index}`,
                    name: model.name || extractNameFromUrl(model.glbUrl) || 'Unnamed Model',
                    description: model.description || '',
                    category: model.category || State.githubConfig.defaultCategory || 'Spiritual',
                    tags: Array.isArray(model.tags) ? model.tags : [],
                    glbUrl: model.glbUrl,
                    thumbnailUrl: model.thumbnailUrl || '',
                    fileSize: model.fileSize || await getFileSize(model.glbUrl),
                    createdAt: model.createdAt || new Date().toISOString(),
                    updatedAt: model.updatedAt || new Date().toISOString(),
                    downloads: model.downloadCount || model.downloads || 0,
                    secure: await checkGLBSecurity(model.glbUrl),
                    source: 'github',
                    rating: model.rating || 0
                };
                
                return processedModel;
            })
        );
        
        State.models = processedModels.filter(model => model.glbUrl);
        
        showToast(`Imported ${State.models.length} models from GitHub`, 'success');
        
    } catch (error) {
        console.error('GitHub import error:', error);
        throw error;
    }
}

async function loadFromJsonUrl(jsonUrl) {
    try {
        const response = await fetch(jsonUrl, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format: expected array');
        }
        
        return data;
    } catch (error) {
        console.error('JSON load error:', error);
        throw error;
    }
}

async function scanGitHubRepository(repo, path) {
    try {
        const [owner, repoName] = repo.split('/');
        
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
        const headers = {};
        
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const contents = await response.json();
        
        const glbFiles = contents.filter(item => 
            item.type === 'file' && 
            item.name.toLowerCase().endsWith('.glb')
        );
        
        const models = glbFiles.map(file => {
            const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}/${file.name}`;
            
            return {
                id: `github_${file.sha}`,
                name: extractNameFromFilename(file.name),
                description: '',
                category: State.githubConfig.defaultCategory || 'Spiritual',
                tags: [],
                glbUrl: rawUrl,
                thumbnailUrl: '',
                fileSize: formatFileSize(file.size),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                downloads: 0,
                secure: false,
                source: 'github'
            };
        });
        
        return models;
        
    } catch (error) {
        console.error('GitHub scan error:', error);
        throw error;
    }
}

async function checkGLBSecurity(url) {
    try {
        // Quick check for filename signature
        if (!url.includes(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE)) {
            return false;
        }
        
        // Download first 1KB to check internal signature
        const response = await fetch(url, {
            headers: { 'Range': 'bytes=0-1023' }
        });
        
        if (!response.ok) {
            return false;
        }
        
        const data = await response.arrayBuffer();
        return signatureInjector.checkHasSignature(data);
        
    } catch (error) {
        console.warn('Security check error:', error);
        return false;
    }
}

async function getFileSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            const size = response.headers.get('content-length');
            if (size) {
                return formatFileSize(parseInt(size));
            }
        }
    } catch (error) {
        console.warn('Failed to get file size:', error);
    }
    return 'Unknown';
}

function extractNameFromFilename(filename) {
    return filename
        .replace(CONFIG.GLB_SECURITY.FILENAME_SIGNATURE, '')
        .replace(/\.glb$/i, '')
        .replace(/[_-]/g, ' ')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());
}

function extractNameFromUrl(url) {
    try {
        const filename = url.split('/').pop();
        return extractNameFromFilename(filename);
    } catch (error) {
        return 'Unnamed Model';
    }
}

function loadSampleModels() {
    State.models = [
        {
            id: 'sample_1',
            name: 'Divine Krishna Statue',
            description: 'Beautiful 3D model of Lord Krishna playing flute',
            category: 'Spiritual',
            tags: ['krishna', 'divine', 'statue', 'hindu'],
            glbUrl: 'https://shank122004-tech.github.io/DivineAppWeb/models/hanuman_gada@divinemantra.glb',
            thumbnailUrl: '',
            fileSize: '4.5 MB',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 1250,
            secure: false,
            source: 'sample'
        },
        {
            id: 'sample_2',
            name: 'Meditation Buddha',
            description: 'Peaceful Buddha statue in meditation pose',
            category: 'Spiritual',
            tags: ['buddha', 'meditation', 'peace', 'statue'],
            glbUrl: 'https://shank122004-tech.github.io/DivineAppWeb/models/hanuman_gada@divinemantra.glb',
            thumbnailUrl: '',
            fileSize: '3.2 MB',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 980,
            secure: false,
            source: 'sample'
        }
    ];
    
    updateCategories();
    showToast('Loaded sample models. Configure GitHub import in Admin Panel.', 'info');
    filterAndSortModels();
    updateStats();
    populateCategories();
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            const cacheTime = Date.now() - CONFIG.CACHE_DURATION;
            if (data.timestamp && new Date(data.timestamp).getTime() > cacheTime) {
                State.models = data.models || [];
                State.categories = new Set(data.categories || []);
                State.isAdmin = data.isAdmin || false;
                State.githubConfig = data.githubConfig || State.githubConfig;
                State.autoSecureDownloads = data.autoSecureDownloads !== false;
                State.autoInjectSignature = data.autoInjectSignature !== false;
                
                if (State.isAdmin) {
                    showAdminDashboard();
                }
                
                if (Elements.autoSecure) Elements.autoSecure.checked = State.autoSecureDownloads;
                if (Elements.autoSignature) Elements.autoSignature.checked = State.autoInjectSignature;
                
                filterAndSortModels();
                updateStats();
                populateCategories();
                
                console.log('Loaded from localStorage:', State.models.length, 'models');
                return true;
            }
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return false;
}

function saveToLocalStorage() {
    try {
        const data = {
            models: State.models,
            categories: Array.from(State.categories),
            isAdmin: State.isAdmin,
            githubConfig: State.githubConfig,
            autoSecureDownloads: State.autoSecureDownloads,
            autoInjectSignature: State.autoInjectSignature,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadSavedData() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
        
        const savedConfig = localStorage.getItem('github_config');
        if (savedConfig) {
            State.githubConfig = { ...State.githubConfig, ...JSON.parse(savedConfig) };
        }
        
        if (Elements.githubRepo) {
            Elements.githubRepo.value = State.githubConfig.repo;
            Elements.modelsPath.value = State.githubConfig.path;
            Elements.jsonUrl.value = State.githubConfig.jsonUrl;
            Elements.autoRefresh.value = State.githubConfig.autoRefresh;
        }
        
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function saveGitHubConfig() {
    try {
        State.githubConfig = {
            repo: Elements.githubRepo.value.trim(),
            path: Elements.modelsPath.value.trim(),
            jsonUrl: Elements.jsonUrl.value.trim(),
            autoRefresh: Elements.autoRefresh.value,
            defaultCategory: Elements.defaultCategory.value
        };
        
        localStorage.setItem('github_config', JSON.stringify(State.githubConfig));
        showToast('GitHub configuration saved', 'success');
        
    } catch (error) {
        console.error('Error saving GitHub config:', error);
        showToast('Failed to save configuration', 'error');
    }
}

// ============================================
// AUTO-SIGNATURE DOWNLOAD SYSTEM
// ============================================

async function downloadSecuredGLB(model) {
    try {
        showToast(`Securing ${model.name} for download...`, 'info');
        
        // Download the original GLB file
        const response = await fetch(model.glbUrl);
        if (!response.ok) {
            throw new Error(`Failed to download: HTTP ${response.status}`);
        }
        
        const originalData = await response.arrayBuffer();
        
        let securedData;
        let securedFilename;
        
        if (State.autoInjectSignature) {
            // Inject signature into GLB
            securedData = await signatureInjector.injectSignature(originalData);
            securedFilename = `${model.name.replace(/\s+/g, '_')}${CONFIG.GLB_SECURITY.FILENAME_SIGNATURE}_secured.glb`;
        } else {
            // Just rename with signature in filename
            securedData = originalData;
            securedFilename = `${model.name.replace(/\s+/g, '_')}${CONFIG.GLB_SECURITY.FILENAME_SIGNATURE}.glb`;
        }
        
        // Create download link
        const blob = new Blob([securedData], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = securedFilename;
        a.style.display = 'none';
        a.rel = 'noopener noreferrer';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Update download count
        model.downloads = (model.downloads || 0) + 1;
        saveToLocalStorage();
        updateAdminModelList();
        
        showToast(`${model.name} downloaded with Divine Mantra signature!`, 'success');
        
        // Verify the downloaded file has signature
        if (State.autoInjectSignature) {
            const hasSignature = signatureInjector.checkHasSignature(securedData);
            if (hasSignature) {
                showToast('✓ Signature verified - Ready for app upload', 'success');
            } else {
                showToast('⚠ Signature verification failed', 'warning');
            }
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Failed to download: ${error.message}`, 'error');
        
        // Fallback to direct download
        downloadDirectGLB(model);
    }
}

function downloadDirectGLB(model) {
    try {
        const a = document.createElement('a');
        a.href = model.glbUrl;
        a.download = `${model.name.replace(/\s+/g, '_')}.glb`;
        a.style.display = 'none';
        a.rel = 'noopener noreferrer';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
        
        model.downloads = (model.downloads || 0) + 1;
        saveToLocalStorage();
        
        showToast(`${model.name} download started!`, 'success');
        
    } catch (error) {
        console.error('Direct download error:', error);
        showToast('Failed to download file', 'error');
    }
}

async function downloadModel(model) {
    if (State.autoSecureDownloads && State.autoInjectSignature) {
        await downloadSecuredGLB(model);
    } else if (State.autoSecureDownloads) {
        await downloadSecuredGLB(model);
    } else {
        downloadDirectGLB(model);
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function updateStats() {
    if (Elements.totalModels) {
        Elements.totalModels.textContent = State.models.length;
    }
}

function updateLoadingIndicator(show) {
    if (show) {
        Elements.loadingIndicator.style.display = 'flex';
        Elements.refreshBtn.classList.add('loading');
    } else {
        Elements.loadingIndicator.style.display = 'none';
        Elements.refreshBtn.classList.remove('loading');
    }
}

function showLoading(show) {
    if (show) {
        Elements.loadingScreen.style.opacity = '1';
        Elements.loadingScreen.style.visibility = 'visible';
    } else {
        Elements.loadingScreen.style.opacity = '0';
        Elements.loadingScreen.style.visibility = 'hidden';
    }
}

function updateCategories() {
    State.categories.clear();
    State.models.forEach(model => {
        if (model.category) {
            State.categories.add(model.category);
        }
    });
}

function populateCategories() {
    if (!Elements.categoriesContainer || !Elements.categoryFilter) return;
    
    Elements.categoriesContainer.innerHTML = '';
    Elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    const allCategory = document.createElement('div');
    allCategory.className = 'category-card';
    allCategory.innerHTML = `
        <div class="category-icon">✨</div>
        <div class="category-name">All Models</div>
        <div class="category-count">${State.models.length} models</div>
    `;
    allCategory.onclick = () => filterByCategory('all');
    Elements.categoriesContainer.appendChild(allCategory);
    
    State.categories.forEach(category => {
        const count = State.models.filter(m => m.category === category).length;
        
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-icon">🎨</div>
            <div class="category-name">${category}</div>
            <div class="category-count">${count} models</div>
        `;
        card.onclick = () => filterByCategory(category);
        Elements.categoriesContainer.appendChild(card);
        
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${category} (${count})`;
        Elements.categoryFilter.appendChild(option);
    });
}

function renderModels() {
    if (State.isLoading || !Elements.galleryContainer) return;
    
    Elements.galleryContainer.innerHTML = '';
    
    if (State.filteredModels.length === 0) {
        if (Elements.noResults) Elements.noResults.style.display = 'block';
        if (Elements.loadingIndicator) Elements.loadingIndicator.style.display = 'none';
        return;
    }
    
    if (Elements.noResults) Elements.noResults.style.display = 'none';
    
    const container = document.createElement('div');
    container.className = State.viewMode === 'grid' ? 'models-grid' : 'models-list';
    
    State.filteredModels.forEach((model, index) => {
        const card = createModelCard(model, index);
        container.appendChild(card);
    });
    
    Elements.galleryContainer.appendChild(container);
}

// ============================================
// GLB THUMBNAIL CREATION - UPDATED FUNCTION
// ============================================

function createModelCard(model, index) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Create GLB thumbnail container
    const thumbnailHTML = `
        <div class="model-thumbnail">
            <div class="glb-thumbnail-container">
                <model-viewer
                    class="glb-thumbnail-viewer"
                    src="${model.glbUrl}"
                    alt="${model.name}"
                    camera-controls
                    camera-orbit="0deg 75deg 100%"
                    field-of-view="30deg"
                    exposure="1"
                    shadow-intensity="1"
                    interaction-prompt="none"
                    disable-zoom
                    disable-pan
                    disable-tap
                    auto-rotate
                    auto-rotate-delay="0"
                    style="width: 100%; height: 100%;"
                >
                    <div slot="progress-bar" style="display: none;"></div>
                </model-viewer>
            </div>
            <span class="model-badge">${model.category}</span>
            ${model.secure ? '<span class="model-badge" style="left: auto; right: 1rem; background: var(--success);">🔒 Secured</span>' : 
              '<span class="model-badge" style="left: auto; right: 1rem; background: var(--warning);">⚠️ Auto-Secure</span>'}
        </div>
    `;
    
    card.innerHTML = `
        ${thumbnailHTML}
        <div class="model-content">
            <div class="model-header">
                <h4 class="model-title">${model.name}</h4>
                <span class="model-category">${model.category}</span>
            </div>
            <p class="model-description">${model.description}</p>
            <div class="model-meta">
                <span>${model.fileSize}</span>
                <span>${formatDate(model.createdAt)}</span>
                <span>${model.downloads.toLocaleString()} downloads</span>
            </div>
            <div class="model-actions">
                <button class="action-btn preview-btn">
                    <i class="fas fa-eye"></i> Preview 3D
                </button>
                <button class="action-btn download-btn">
                    <i class="fas fa-download"></i> ${State.autoInjectSignature ? 'Download Secured' : 'Download'}
                </button>
            </div>
        </div>
    `;
    
    const previewBtn = card.querySelector('.preview-btn');
    const downloadBtn = card.querySelector('.download-btn');
    
    previewBtn.onclick = (e) => {
        e.stopPropagation();
        openPreview(model);
    };
    
    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        downloadModel(model);
    };
    
    card.onclick = () => openPreview(model);
    
    // Initialize the model-viewer after adding to DOM
    setTimeout(() => {
        const viewer = card.querySelector('.glb-thumbnail-viewer');
        if (viewer) {
            viewer.addEventListener('error', (e) => {
                console.warn('Thumbnail GLB load error:', e);
                const container = card.querySelector('.glb-thumbnail-container');
                if (container) {
                    container.innerHTML = '<div class="thumbnail-placeholder">🎨</div>';
                }
            });
        }
    }, 100);
    
    return card;
}

// ============================================
// FILTER AND SORT FUNCTIONS
// ============================================

function filterAndSortModels() {
    let filtered = [...State.models];
    
    if (State.searchQuery) {
        const query = State.searchQuery.toLowerCase();
        filtered = filtered.filter(model => 
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.category.toLowerCase().includes(query) ||
            model.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    if (State.currentCategory !== 'all') {
        filtered = filtered.filter(model => model.category === State.currentCategory);
    }
    
    filtered.sort((a, b) => {
        switch (State.sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'popular':
                return b.downloads - a.downloads;
            default:
                return 0;
        }
    });
    
    State.filteredModels = filtered;
    renderModels();
}

function filterByCategory(category) {
    State.currentCategory = category;
    if (Elements.categoryFilter) {
        Elements.categoryFilter.value = category;
    }
    filterAndSortModels();
    scrollToSection('gallery');
}

function searchModels(query) {
    State.searchQuery = query;
    filterAndSortModels();
}

function sortModels(sortBy) {
    State.sortBy = sortBy;
    filterAndSortModels();
}

function clearFilters() {
    State.searchQuery = '';
    State.currentCategory = 'all';
    State.sortBy = 'name-asc';
    
    if (Elements.gallerySearch) Elements.gallerySearch.value = '';
    if (Elements.categoryFilter) Elements.categoryFilter.value = 'all';
    if (Elements.sortSelect) Elements.sortSelect.value = 'name-asc';
    
    filterAndSortModels();
}

// ============================================
// PREVIEW MODAL FUNCTIONS
// ============================================

function openPreview(model) {
    State.currentPreviewModel = model;
    
    if (Elements.previewTitle) Elements.previewTitle.textContent = model.name;
    if (Elements.previewSubtitle) Elements.previewSubtitle.textContent = model.category;
    if (Elements.previewName) Elements.previewName.textContent = model.name;
    if (Elements.previewCategory) Elements.previewCategory.textContent = model.category;
    if (Elements.previewSize) Elements.previewSize.textContent = model.fileSize;
    if (Elements.previewDate) Elements.previewDate.textContent = formatDate(model.createdAt);
    if (Elements.previewDescription) Elements.previewDescription.textContent = model.description || 'No description available.';
    
    if (Elements.previewTags) {
        Elements.previewTags.innerHTML = '';
        if (model.tags && model.tags.length > 0) {
            model.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                Elements.previewTags.appendChild(tagElement);
            });
        }
    }
    
    if (Elements.previewViewer) {
        Elements.previewViewer.src = model.glbUrl;
        Elements.previewViewer.autoRotate = State.autoRotateEnabled;
    }
    
    if (Elements.rotateToggle) {
        Elements.rotateToggle.classList.toggle('active', State.autoRotateEnabled);
    }
    
    if (Elements.previewModal) {
        Elements.previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePreview() {
    if (Elements.previewModal) {
        Elements.previewModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (Elements.previewViewer) {
        Elements.previewViewer.src = '';
    }
    State.currentPreviewModel = null;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

function openAdminPanel() {
    if (Elements.adminOverlay) {
        Elements.adminOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateAdminModelList();
        updateAdminStatus('Ready');
    }
}

function closeAdminPanel() {
    if (Elements.adminOverlay) {
        Elements.adminOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (Elements.importStatus) {
        Elements.importStatus.style.display = 'none';
    }
}

function showAdminDashboard() {
    if (Elements.adminLogin) Elements.adminLogin.style.display = 'none';
    if (Elements.adminDashboard) Elements.adminDashboard.style.display = 'block';
    State.isAdmin = true;
    saveToLocalStorage();
    updateAdminStatus('Ready');
}

function hideAdminDashboard() {
    if (Elements.adminDashboard) Elements.adminDashboard.style.display = 'none';
    if (Elements.adminLogin) Elements.adminLogin.style.display = 'block';
    if (Elements.adminPassword) Elements.adminPassword.value = '';
    State.isAdmin = false;
    saveToLocalStorage();
}

function checkAdminStatus() {
    if (State.isAdmin) {
        showAdminDashboard();
    }
}

function updateAdminModelList() {
    if (!Elements.adminModelsList || !Elements.modelsCount) return;
    
    Elements.adminModelsList.innerHTML = '';
    Elements.modelsCount.textContent = State.models.length;
    
    State.models.forEach((model, index) => {
        const item = document.createElement('div');
        item.className = 'admin-model-item';
        item.innerHTML = `
            <div class="model-thumb-small">
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#8b5cf6,#3b82f6);color:white;">
                    🎨
                </div>
            </div>
            <div class="model-info-small">
                <h6>${model.name}</h6>
                <span>${model.category} • ${model.downloads} downloads</span>
                <span style="color: ${model.secure ? 'var(--success)' : 'var(--warning)'}; font-size: 0.7rem;">
                    ${model.secure ? '🔒 Pre-Secured' : '⚠️ Auto-Secure on Download'}
                </span>
            </div>
            <div class="model-actions-small">
                <button class="action-btn-small preview-btn" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn-small delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        const previewBtn = item.querySelector('.preview-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        previewBtn.onclick = (e) => {
            e.stopPropagation();
            closeAdminPanel();
            setTimeout(() => openPreview(model), 300);
        };
        
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${model.name}"? This action cannot be undone.`)) {
                deleteModelFromGallery(model.id);
            }
        };
        
        Elements.adminModelsList.appendChild(item);
    });
}

// ============================================
// GITHUB IMPORT FUNCTIONS
// ============================================

async function testGitHubConnection() {
    try {
        const repo = Elements.githubRepo.value.trim();
        if (!repo) {
            throw new Error('Please enter a GitHub repository');
        }
        
        updateAdminStatus('Testing connection...', 'loading');
        
        const [owner, repoName] = repo.split('/');
        if (!owner || !repoName) {
            throw new Error('Invalid repository format. Use: username/repository-name');
        }
        
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
        const headers = {};
        
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`Repository not found or inaccessible (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        
        updateAdminStatus('Connection successful!', 'success');
        showToast(`Connected to ${repo} successfully`, 'success');
        
        return data;
        
    } catch (error) {
        updateAdminStatus('Connection failed', 'error');
        showToast(`Connection failed: ${error.message}`, 'error');
        throw error;
    }
}

async function importModelsFromGitHub() {
    try {
        saveGitHubConfig();
        
        updateAdminStatus('Starting import...', 'loading');
        if (Elements.importStatus) Elements.importStatus.style.display = 'block';
        if (Elements.importDetails) Elements.importDetails.innerHTML = '<p>Connecting to GitHub repository...</p>';
        
        await testGitHubConnection();
        
        if (Elements.importDetails) Elements.importDetails.innerHTML += '<p>Scanning for GLB files...</p>';
        
        const previousCount = State.models.length;
        await importFromGitHub();
        
        const importedCount = State.models.length - previousCount;
        
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        
        if (Elements.importDetails) {
            Elements.importDetails.innerHTML += `
                <p><strong>Import completed successfully!</strong></p>
                <p>Imported ${importedCount} new models</p>
                <p>Total models: ${State.models.length}</p>
            `;
        }
        
        updateAdminStatus('Import completed', 'success');
        showToast(`Imported ${importedCount} models from Spiritual Server`, 'success');
        
        setTimeout(() => {
            if (Elements.importStatus) Elements.importStatus.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Import error:', error);
        if (Elements.importDetails) {
            Elements.importDetails.innerHTML += `<p style="color: var(--error);"><strong>Import failed:</strong> ${error.message}</p>`;
        }
        updateAdminStatus('Import failed', 'error');
        showToast(`Import failed: ${error.message}`, 'error');
    }
}

function exportModelList() {
    try {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalModels: State.models.length,
            models: State.models.map(model => ({
                name: model.name,
                category: model.category,
                description: model.description,
                glbUrl: model.glbUrl,
                secure: model.secure,
                downloads: model.downloads,
                createdAt: model.createdAt
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `divine_models_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Model list exported successfully', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export model list', 'error');
    }
}

function clearAllModels() {
    if (confirm('Are you sure you want to clear all models? This action cannot be undone.')) {
        State.models = [];
        updateCategories();
        saveToLocalStorage();
        updateStats();
        populateCategories();
        filterAndSortModels();
        updateAdminModelList();
        showToast('All models cleared', 'info');
    }
}

function deleteModelFromGallery(modelId) {
    const index = State.models.findIndex(m => m.id === modelId);
    if (index === -1) return;
    
    const modelName = State.models[index].name;
    State.models.splice(index, 1);
    
    updateCategories();
    saveToLocalStorage();
    updateStats();
    populateCategories();
    filterAndSortModels();
    updateAdminModelList();
    
    showToast(`${modelName} deleted from gallery`, 'info');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Unknown';
    }
}

function formatFileSize(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes)) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
    if (!Elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    };
    
    Elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateAdminStatus(message, type = 'ready') {
    if (!Elements.adminStatus) return;
    
    const icon = Elements.adminStatus.querySelector('i');
    const text = Elements.adminStatus.querySelector('span');
    
    if (text) text.textContent = message;
    
    if (type === 'loading') {
        if (icon) icon.className = 'fas fa-circle status-loading';
    } else if (type === 'error') {
        if (icon) {
            icon.className = 'fas fa-circle';
            icon.style.color = 'var(--error)';
        }
    } else if (type === 'success') {
        if (icon) {
            icon.className = 'fas fa-circle';
            icon.style.color = 'var(--success)';
        }
    } else {
        if (icon) icon.className = 'fas fa-circle status-ready';
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Theme toggle
    if (Elements.themeToggle) {
        Elements.themeToggle.onclick = () => {
            document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        };
    }
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (Elements.mainHeader) {
            if (window.scrollY > 50) {
                Elements.mainHeader.classList.add('scrolled');
            } else {
                Elements.mainHeader.classList.remove('scrolled');
            }
        }
        
        if (Elements.fabScrollTop) {
            if (window.scrollY > 500) {
                Elements.fabScrollTop.classList.add('visible');
            } else {
                Elements.fabScrollTop.classList.remove('visible');
            }
        }
    });
    
    // Navigation
    if (Elements.navToggle && Elements.navLinks) {
        Elements.navToggle.onclick = () => {
            Elements.navLinks.classList.toggle('active');
        };
        
        document.addEventListener('click', (e) => {
            if (!Elements.navToggle.contains(e.target) && !Elements.navLinks.contains(e.target)) {
                Elements.navLinks.classList.remove('active');
            }
        });
    }
    
    // APK Download
    if (Elements.apkDownloadBtn) Elements.apkDownloadBtn.onclick = openApkModal;
    if (Elements.openApkModalBtn) Elements.openApkModalBtn.onclick = openApkModal;
    if (Elements.closeApkModal) Elements.closeApkModal.onclick = closeApkModal;
    if (Elements.apkModal) {
        Elements.apkModal.onclick = (e) => {
            if (e.target === Elements.apkModal) {
                closeApkModal();
            }
        };
    }
    
    // Search
    if (Elements.searchBtn && Elements.searchInput) {
        Elements.searchBtn.onclick = () => {
            searchModels(Elements.searchInput.value);
        };
        
        Elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchModels(Elements.searchInput.value);
            }
        });
    }
    
    if (Elements.gallerySearch) {
        Elements.gallerySearch.addEventListener('input', (e) => {
            searchModels(e.target.value);
        });
    }
    
    // Filters
    if (Elements.categoryFilter) {
        Elements.categoryFilter.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
    }
    
    if (Elements.clearFilters) {
        Elements.clearFilters.onclick = clearFilters;
    }
    
    if (Elements.sortSelect) {
        Elements.sortSelect.addEventListener('change', (e) => {
            sortModels(e.target.value);
        });
    }
    
    // View mode
    if (Elements.viewBtns) {
        Elements.viewBtns.forEach(btn => {
            btn.onclick = () => {
                Elements.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                State.viewMode = btn.dataset.view;
                renderModels();
            };
        });
    }
    
    // Refresh
    if (Elements.refreshBtn) {
        Elements.refreshBtn.onclick = async () => {
            Elements.refreshBtn.classList.add('loading');
            await loadModels();
            Elements.refreshBtn.classList.remove('loading');
            showToast('Models refreshed!', 'success');
        };
    }
    
    // Admin - SECURE LOGIN
    if (Elements.loginBtn && Elements.adminPassword) {
        Elements.loginBtn.onclick = async () => {
            const password = Elements.adminPassword.value;
            
            if (!password) {
                showToast('Please enter password', 'error');
                return;
            }
            
            // Show loading state
            Elements.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            Elements.loginBtn.disabled = true;
            
            try {
                // Use secure authentication
                const result = await secureAuth.verifyPassword(password);
                
                if (result.success) {
                    showAdminDashboard();
                    showToast('Admin panel unlocked!', 'success');
                } else {
                    showToast(result.error || 'Incorrect password', 'error');
                }
            } catch (error) {
                showToast('Authentication failed. Please try again.', 'error');
            } finally {
                // Reset button state
                Elements.loginBtn.innerHTML = '<i class="fas fa-unlock"></i> Unlock Panel';
                Elements.loginBtn.disabled = false;
            }
        };
    }
    
    if (Elements.logoutBtn) {
        Elements.logoutBtn.onclick = () => {
            hideAdminDashboard();
            showToast('Logged out from admin panel', 'info');
        };
    }
    
    if (Elements.adminBtn) Elements.adminBtn.onclick = openAdminPanel;
    if (Elements.closeAdmin) Elements.closeAdmin.onclick = closeAdminPanel;
    if (Elements.fabImport) Elements.fabImport.onclick = openAdminPanel;
    
    // Admin tabs
    if (Elements.tabBtns && Elements.tabPanes) {
        Elements.tabBtns.forEach(btn => {
            btn.onclick = () => {
                Elements.tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tabId = btn.dataset.tab;
                Elements.tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === `${tabId}Tab`) {
                        pane.classList.add('active');
                    }
                });
            };
        });
    }
    
    // GitHub Import
    if (Elements.testConnection) Elements.testConnection.onclick = testGitHubConnection;
    if (Elements.importModelsBtn) Elements.importModelsBtn.onclick = importModelsFromGitHub;
    
    // Save GitHub config on change
    const githubElements = [Elements.githubRepo, Elements.modelsPath, Elements.jsonUrl, Elements.autoRefresh, Elements.defaultCategory];
    githubElements.forEach(element => {
        if (element) {
            element.addEventListener('change', saveGitHubConfig);
        }
    });
    
    // Model Management
    if (Elements.exportModels) Elements.exportModels.onclick = exportModelList;
    if (Elements.clearAllModels) Elements.clearAllModels.onclick = clearAllModels;
    
    // Security
    if (Elements.autoSecure) {
        Elements.autoSecure.addEventListener('change', (e) => {
            State.autoSecureDownloads = e.target.checked;
            saveToLocalStorage();
            showToast(`Auto-secure downloads ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }
    
    if (Elements.autoSignature) {
        Elements.autoSignature.addEventListener('change', (e) => {
            State.autoInjectSignature = e.target.checked;
            saveToLocalStorage();
            showToast(`Auto-signature injection ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }
    
    if (Elements.resetSecurity) {
        Elements.resetSecurity.onclick = () => {
            if (confirm('Reset all security settings to defaults?')) {
                State.autoSecureDownloads = true;
                State.autoInjectSignature = true;
                if (Elements.autoSecure) Elements.autoSecure.checked = true;
                if (Elements.autoSignature) Elements.autoSignature.checked = true;
                saveToLocalStorage();
                showToast('Security settings reset to defaults', 'success');
            }
        };
    }
    
    if (Elements.backupData) {
        Elements.backupData.onclick = () => {
            saveToLocalStorage();
            showToast('All data backed up to local storage', 'success');
        };
    }
    
    // Preview modal
    if (Elements.closePreview) Elements.closePreview.onclick = closePreview;
    if (Elements.previewModal) {
        Elements.previewModal.onclick = (e) => {
            if (e.target === Elements.previewModal) {
                closePreview();
            }
        };
    }
    
    if (Elements.downloadModel) {
        Elements.downloadModel.onclick = () => {
            if (State.currentPreviewModel) {
                downloadModel(State.currentPreviewModel);
            }
        };
    }
    
    if (Elements.copyUrl) Elements.copyUrl.onclick = copyModelUrl;
    if (Elements.shareModel) Elements.shareModel.onclick = shareModel;
    
    if (Elements.rotateToggle) {
        Elements.rotateToggle.onclick = () => {
            State.autoRotateEnabled = !State.autoRotateEnabled;
            if (Elements.previewViewer) Elements.previewViewer.autoRotate = State.autoRotateEnabled;
            Elements.rotateToggle.classList.toggle('active', State.autoRotateEnabled);
            showToast(`Auto-rotate ${State.autoRotateEnabled ? 'enabled' : 'disabled'}`, 'info');
        };
    }
    
    if (Elements.fullscreenToggle && Elements.previewViewer) {
        Elements.fullscreenToggle.onclick = () => {
            if (Elements.previewViewer.requestFullscreen) {
                Elements.previewViewer.requestFullscreen();
            } else if (Elements.previewViewer.webkitRequestFullscreen) {
                Elements.previewViewer.webkitRequestFullscreen();
            }
        };
    }
    
    if (Elements.resetView && Elements.previewViewer) {
        Elements.resetView.onclick = () => {
            Elements.previewViewer.cameraOrbit = '0deg 75deg 105%';
            Elements.previewViewer.fieldOfView = '30deg';
        };
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (Elements.previewModal && Elements.previewModal.classList.contains('active')) {
                closePreview();
            }
            if (Elements.adminOverlay && Elements.adminOverlay.classList.contains('active')) {
                closeAdminPanel();
            }
            if (Elements.apkModal && Elements.apkModal.classList.contains('active')) {
                closeApkModal();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (Elements.searchInput) Elements.searchInput.focus();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openAdminPanel();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            openApkModal();
        }
    });
    
    // Handle model viewer errors
    if (Elements.previewViewer) {
        Elements.previewViewer.addEventListener('error', (e) => {
            console.error('Model viewer error:', e);
            showToast('Failed to load 3D model. The file might be corrupted or inaccessible.', 'error');
        });
    }
    
    // Initialize hero preview with first model
    if (Elements.heroPreview && State.models.length > 0) {
        Elements.heroPreview.src = State.models[0].glbUrl;
    }
    
    // Handle touch events for mobile
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // Prevent zoom on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

async function copyModelUrl() {
    if (!State.currentPreviewModel) return;
    
    try {
        await navigator.clipboard.writeText(State.currentPreviewModel.glbUrl);
        showToast('Model URL copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Failed to copy URL', 'error');
    }
}

async function shareModel() {
    if (!State.currentPreviewModel) return;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: State.currentPreviewModel.name,
                text: State.currentPreviewModel.description,
                url: window.location.href + '#preview'
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share error:', error);
            showToast('Failed to share', 'error');
        }
    }
}

// ============================================
// INITIALIZE
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose key functions to global scope
window.openPreview = openPreview;
window.downloadModel = downloadModel;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.openApkModal = openApkModal;
window.closeApkModal = closeApkModal;
window.scrollToSection = scrollToSection;
window.scrollToTop = scrollToTop;
window.clearFilters = clearFilters;
window.filterByCategory = filterByCategory;

// Handle online/offline status
window.addEventListener('online', () => {
    showToast('Back online. Models syncing...', 'success');
    loadModels();
});

window.addEventListener('offline', () => {
    showToast('You are offline. Using cached models.', 'warning');
});
