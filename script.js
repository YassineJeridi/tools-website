// ============================================
// MODERN FREE TOOLS WEBSITE - JAVASCRIPT
// ============================================

// ========== GLOBAL STATE ==========
let toolsData = null;
let allTools = [];

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    loadToolsData();
    initNavigation();
    initSearch();
    initBackToTop();
    initAnimations();
});

// ========== LOAD DATA ==========
async function loadToolsData() {
    try {
        const response = await fetch('tools_data.json');
        toolsData = await response.json();

        // Flatten all tools for searching
        allTools = [];
        toolsData.categories.forEach(category => {
            category.tools.forEach(tool => {
                allTools.push({
                    ...tool,
                    categoryName: category.name,
                    categoryIcon: category.icon,
                    categoryId: category.id
                });
            });
        });

        renderCategories();
        renderTools();
        updateToolCount();
    } catch (error) {
        console.error('Error loading tools data:', error);
    }
}

// ========== NAVIGATION ==========
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger icon
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = navLinks.classList.contains('active') 
                ? 'rotate(45deg) translateY(8px)' : '';
            spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navLinks.classList.contains('active') 
                ? 'rotate(-45deg) translateY(-8px)' : '';
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== SEARCH ==========
function initSearch() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchBtn = document.getElementById('searchBtn');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    const searchClose = document.getElementById('searchClose');

    // Open search modal
    const openSearch = () => {
        searchModal.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
    };

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (heroSearchBtn) heroSearchBtn.addEventListener('click', openSearch);

    // Close search modal
    const closeSearch = () => {
        searchModal.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    };

    if (searchClose) searchClose.addEventListener('click', closeSearch);

    // Close on outside click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearch();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim().toLowerCase();

            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const results = allTools.filter(tool => 
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.categoryName.toLowerCase().includes(query)
            );

            displaySearchResults(results, query);
        }, 300));
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <div class="search-no-results-icon">🔍</div>
                <p>No tools found for "${query}"</p>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.map(tool => `
        <a href="${tool.url}" class="search-result-item" target="_blank" rel="noopener noreferrer">
            <div class="search-result-category">${tool.categoryIcon} ${tool.categoryName}</div>
            <div class="search-result-name">${tool.name}</div>
            <div class="search-result-desc">${tool.description}</div>
        </a>
    `).join('');
}

// ========== RENDER CATEGORIES ==========
function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid || !toolsData) return;

    const html = toolsData.categories.map(category => `
        <div class="category-card" onclick="scrollToCategory('${category.id}')">
            <span class="category-icon">${category.icon}</span>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.tools.length} tools</p>
        </div>
    `).join('');

    categoriesGrid.innerHTML = html;
}

// ========== RENDER TOOLS ==========
function renderTools() {
    const toolsContainer = document.getElementById('toolsContainer');
    if (!toolsContainer || !toolsData) return;

    const html = toolsData.categories.map(category => `
        <div class="category-section" id="${category.id}">
            <div class="category-header">
                <span class="category-header-icon">${category.icon}</span>
                <h2 class="category-header-title">${category.name}</h2>
            </div>
            <div class="tools-grid">
                ${renderCategoryTools(category)}
            </div>
        </div>
    `).join('');

    toolsContainer.innerHTML = html;
}

function renderCategoryTools(category) {
    return category.tools.map(tool => `
        <a href="${tool.url}" class="tool-card" target="_blank" rel="noopener noreferrer">
            <h3 class="tool-name">${tool.name}</h3>
            <p class="tool-description">${tool.description}</p>
        </a>
    `).join('');
}

// ========== SCROLL TO CATEGORY ==========
function scrollToCategory(categoryId) {
    const element = document.getElementById(categoryId);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// ========== UPDATE TOOL COUNT ==========
function updateToolCount() {
    if (!toolsData) return;

    const totalTools = toolsData.categories.reduce(
        (sum, category) => sum + category.tools.length, 
        0
    );

    const toolCountElement = document.querySelector('.stat-number');
    if (toolCountElement) {
        animateNumber(toolCountElement, totalTools);
    }
}

// ========== ANIMATE NUMBER ==========
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 30);
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== ANIMATIONS ==========
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loading');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe tool cards
    setTimeout(() => {
        document.querySelectorAll('.tool-card, .category-card').forEach(card => {
            observer.observe(card);
        });
    }, 100);
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
