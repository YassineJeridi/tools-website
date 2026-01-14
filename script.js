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
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.slice(0, 20).map(tool => `
        <div class="search-result-item" onclick="scrollToTool('${tool.categoryId}')">
            <div class="search-result-category">${tool.categoryIcon} ${tool.categoryName}</div>
            <div class="search-result-name">${highlightText(tool.name, query)}</div>
            <div class="search-result-desc">${highlightText(tool.description, query)}</div>
        </div>
    `).join('');
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #fef3c7; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

function scrollToTool(categoryId) {
    const searchModal = document.getElementById('searchModal');
    searchModal.classList.remove('active');

    setTimeout(() => {
        const element = document.getElementById(categoryId);
        if (element) {
            const offsetTop = element.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }, 300);
}

// ========== RENDER CATEGORIES ==========
function renderCategories() {
    if (!toolsData) return;

    const categoriesGrid = document.getElementById('categoriesGrid');

    const html = toolsData.categories.map(category => `
        <div class="category-card loading" onclick="scrollToTool('${category.id}')" 
             data-category="${getCategoryType(category.name)}">
            <span class="category-icon">${category.icon}</span>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.tools.length} tools</p>
        </div>
    `).join('');

    categoriesGrid.innerHTML = html;

    // Init category filters
    initCategoryFilters();
}

function getCategoryType(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('design') || lowerName.includes('color') || 
        lowerName.includes('icon') || lowerName.includes('typography') || 
        lowerName.includes('photo') || lowerName.includes('image') ||
        lowerName.includes('inspiration') || lowerName.includes('branding')) {
        return 'design';
    }
    if (lowerName.includes('develop') || lowerName.includes('code') || lowerName.includes('github')) {
        return 'development';
    }
    if (lowerName.includes('seo') || lowerName.includes('social') || 
        lowerName.includes('email') || lowerName.includes('marketing') ||
        lowerName.includes('content') || lowerName.includes('writing')) {
        return 'marketing';
    }
    return 'business';
}

function initCategoryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryCards = document.querySelectorAll('.category-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter categories
            categoryCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ========== RENDER TOOLS ==========
function renderTools() {
    if (!toolsData) return;

    const toolsContainer = document.getElementById('toolsContainer');

    const html = toolsData.categories.map(category => `
        <div class="category-section loading" id="${category.id}">
            <div class="category-header">
                <span class="category-header-icon">${category.icon}</span>
                <h2 class="category-header-title">${category.name}</h2>
            </div>
            <div class="tools-grid">
                ${category.tools.map(tool => `
                    <div class="tool-card">
                        <h3 class="tool-name">${tool.name}</h3>
                        <p class="tool-description">${tool.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    toolsContainer.innerHTML = html;
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
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
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all loading elements
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => {
            observer.observe(el);
        });
    }, 100);
}

// ========== UTILITIES ==========
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

function updateToolCount() {
    const toolCountElement = document.getElementById('toolCount');
    if (toolCountElement && allTools.length > 0) {
        animateCount(toolCountElement, allTools.length, 2000);
    }
}

function animateCount(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

// ========== EXPORT FOR INLINE USE ==========
window.scrollToTool = scrollToTool;