/**
 * DEVGENZ CELEBRATION - Interactive Experience
 * Ummisalma Aminu Birthday Digital Experience
 * 
 * Features:
 * - Spotlight cursor effect
 * - Horizontal scroll timeline with sticky logic
 * - Intersection Observer for reveal animations
 * - Counter animations
 * - Parallax effects
 * - Celebration confetti
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const lerp = (start, end, factor) => start + (end - start) * factor;

// ========================================
// SPOTLIGHT CURSOR EFFECT
// ========================================

class SpotlightEffect {
    constructor() {
        this.spotlight = document.querySelector('.spotlight');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.currentX = this.mouseX;
        this.currentY = this.mouseY;
        this.isActive = true;
        
        this.init();
    }
    
    init() {
        if (!this.spotlight) return;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }, { passive: true });
        
        // Handle touch devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
        
        this.animate();
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Smooth interpolation for 60fps feel
        this.currentX = lerp(this.currentX, this.mouseX, 0.15);
        this.currentY = lerp(this.currentY, this.mouseY, 0.15);
        
        this.spotlight.style.left = `${this.currentX}px`;
        this.spotlight.style.top = `${this.currentY}px`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// INTERSECTION OBSERVER - REVEAL ANIMATIONS
// ========================================

class RevealAnimator {
    constructor() {
        this.elements = document.querySelectorAll('.reveal-text');
        this.observer = null;
        this.init();
    }
    
    init() {
        const options = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.elements.forEach(el => this.observer.observe(el));
    }
}

// ========================================
// COUNTER ANIMATION
// ========================================

class CounterAnimator {
    constructor() {
        this.counters = document.querySelectorAll('[data-count]');
        this.observer = null;
        this.init();
    }
    
    init() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.counters.forEach(counter => this.observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function - easeOutExpo
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            const currentValue = Math.floor(startValue + (target - startValue) * easeProgress);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// ========================================
// HORIZONTAL SCROLL TIMELINE
// ========================================

class HorizontalTimeline {
    constructor() {
        this.container = document.querySelector('.horizontal-scroll-container');
        this.track = document.querySelector('.horizontal-scroll-track');
        this.progressFill = document.querySelector('.progress-fill');
        this.dots = document.querySelectorAll('.dot');
        this.cards = document.querySelectorAll('.milestone-card');
        
        this.scrollProgress = 0;
        this.maxScroll = 0;
        this.isInView = false;
        
        this.init();
    }
    
    init() {
        if (!this.container || !this.track) return;
        
        this.calculateDimensions();
        this.setupIntersectionObserver();
        this.setupScrollListener();
        this.setupResizeListener();
        this.setupDotClickHandlers();
        this.setupParallax();
    }
    
    calculateDimensions() {
        const trackWidth = this.track.scrollWidth;
        const containerWidth = this.container.offsetWidth;
        this.maxScroll = trackWidth - containerWidth + 160; // Add padding
    }
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 1]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isInView = entry.isIntersecting && entry.intersectionRatio > 0.1;
            });
        }, options);
        
        observer.observe(this.container);
    }
    
    setupScrollListener() {
        window.addEventListener('scroll', () => {
            if (!this.isInView) return;
            
            this.updateScrollProgress();
            this.updateTrackPosition();
            this.updateProgressBar();
            this.updateActiveDot();
        }, { passive: true });
    }
    
    setupResizeListener() {
        window.addEventListener('resize', debounce(() => {
            this.calculateDimensions();
            this.updateScrollProgress();
            this.updateTrackPosition();
        }, 250));
    }
    
    setupDotClickHandlers() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const scrollToProgress = index / (this.dots.length - 1);
                const containerRect = this.container.getBoundingClientRect();
                const scrollTarget = window.scrollY + containerRect.top + 
                    (scrollToProgress * this.maxScroll);
                
                window.scrollTo({
                    top: scrollTarget,
                    behavior: 'smooth'
                });
            });
        });
    }
    
    updateScrollProgress() {
        const containerRect = this.container.getBoundingClientRect();
        const containerTop = containerRect.top;
        const windowHeight = window.innerHeight;
        
        // Calculate how far we've scrolled through the container
        const scrollStart = windowHeight * 0.2;
        const scrollRange = windowHeight * 0.6;
        
        let progress = (scrollStart - containerTop) / scrollRange;
        progress = Math.max(0, Math.min(1, progress));
        
        this.scrollProgress = progress;
    }
    
    updateTrackPosition() {
        const translateX = -this.scrollProgress * this.maxScroll;
        this.track.style.transform = `translateX(${translateX}px)`;
    }
    
    updateProgressBar() {
        if (this.progressFill) {
            this.progressFill.style.width = `${this.scrollProgress * 100}%`;
        }
    }
    
    updateActiveDot() {
        const activeIndex = Math.round(this.scrollProgress * (this.dots.length - 1));
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    setupParallax() {
        // Parallax effect for card backgrounds
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        
        window.addEventListener('scroll', () => {
            if (!this.isInView) return;
            
            parallaxLayers.forEach((layer, index) => {
                const speed = (index + 1) * 0.3;
                const offset = this.scrollProgress * 50 * speed;
                layer.style.transform = `translateX(${offset}px)`;
            });
        }, { passive: true });
    }
}

// ========================================
// DAYS COUNTER - LEGACY CARD
// ========================================

class DaysCounter {
    constructor() {
        this.counter = document.getElementById('days-counter');
        this.targetDate = new Date('2024-04-09'); // DevGenZ founding date
        this.init();
    }
    
    init() {
        if (!this.counter) return;
        
        const days = this.calculateDays();
        this.animateToValue(days);
    }
    
    calculateDays() {
        const now = new Date();
        const diffTime = Math.abs(now - this.targetDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    animateToValue(target) {
        const duration = 2500;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(target * easeProgress);
            
            this.counter.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                this.counter.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(update);
    }
}

// ========================================
// BENTO CARD INTERACTIONS
// ========================================

class BentoInteractions {
    constructor() {
        this.cards = document.querySelectorAll('.bento-card');
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            this.setupCardHover(card);
        });
        
        this.setupTechItems();
    }
    
    setupCardHover(card) {
        const glass = card.querySelector('.card-glass');
        if (!glass) return;
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            glass.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            glass.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    }
    
    setupTechItems() {
        const techItems = document.querySelectorAll('.tech-item');
        
        techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const tech = item.dataset.tech;
                this.showTechPreview(tech);
            });
        });
    }
    
    showTechPreview(tech) {
        // Could expand to show tech details
        console.log(`Tech hovered: ${tech}`);
    }
}

// ========================================
// CELEBRATION CONFETTI
// ========================================

class CelebrationEffect {
    constructor() {
        this.button = document.getElementById('celebrate-btn');
        this.colors = ['#d4af37', '#8b5cf6', '#f4d03f', '#a78bfa', '#b8860b'];
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.button) return;
        
        this.button.addEventListener('click', () => {
            this.triggerConfetti();
            this.triggerButtonAnimation();
        });
    }
    
    triggerButtonAnimation() {
        this.button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.button.style.transform = '';
        }, 150);
    }
    
    triggerConfetti() {
        const count = 150;
        const container = document.body;
        
        for (let i = 0; i < count; i++) {
            this.createConfettiPiece(container);
        }
    }
    
    createConfettiPiece(container) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        // Random properties
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 10 + 5;
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 15 + 10;
        const gravity = 0.5;
        const drag = 0.98;
        
        // Set initial styles
        piece.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            pointer-events: none;
            z-index: 9999;
            left: ${startX}px;
            top: ${startY}px;
            box-shadow: 0 0 10px ${color};
        `;
        
        container.appendChild(piece);
        
        // Animate
        let posX = startX;
        let posY = startY;
        let velX = Math.cos(angle) * velocity;
        let velY = Math.sin(angle) * velocity;
        let rotation = 0;
        let rotationSpeed = (Math.random() - 0.5) * 20;
        let opacity = 1;
        
        const animate = () => {
            velX *= drag;
            velY *= drag;
            velY += gravity;
            
            posX += velX;
            posY += velY;
            rotation += rotationSpeed;
            opacity -= 0.008;
            
            piece.style.left = `${posX}px`;
            piece.style.top = `${posY}px`;
            piece.style.transform = `rotate(${rotation}deg)`;
            piece.style.opacity = opacity;
            
            if (opacity > 0 && posY < window.innerHeight + 100) {
                requestAnimationFrame(animate);
            } else {
                piece.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// ========================================
// SMOOTH SCROLL
// ========================================

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================

class HeaderScrollEffect {
    constructor() {
        this.header = document.querySelector('.persistent-header');
        this.lastScrollY = 0;
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class based on scroll position
            if (currentScrollY > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            this.lastScrollY = currentScrollY;
        }, { passive: true });
    }
}

// ========================================
// FLOATING ELEMENTS ANIMATION
// ========================================

class FloatingElements {
    constructor() {
        this.elements = document.querySelectorAll('.floating-badge, .gradient-orb');
        this.init();
    }
    
    init() {
        // Add subtle floating animation using GSAP-like approach
        this.elements.forEach((el, index) => {
            const delay = index * 0.5;
            const duration = 4 + Math.random() * 2;
            const amplitude = 10 + Math.random() * 10;
            
            this.floatElement(el, delay, duration, amplitude);
        });
    }
    
    floatElement(element, delay, duration, amplitude) {
        const startTime = performance.now() + delay * 1000;
        
        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            
            if (elapsed < 0) {
                requestAnimationFrame(animate);
                return;
            }
            
            const y = Math.sin(elapsed * Math.PI * 2 / duration) * amplitude;
            element.style.transform = `translateY(${y}px)`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
}

// ========================================
// TYPING EFFECT FOR CODE SNIPPET
// ========================================

class CodeTypingEffect {
    constructor() {
        this.codeElement = document.querySelector('.code-snippet code');
        this.init();
    }
    
    init() {
        if (!this.codeElement) return;
        
        // Store original content
        const originalHTML = this.codeElement.innerHTML;
        
        // Create intersection observer to trigger typing
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.typeCode(originalHTML);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.codeElement);
    }
    
    typeCode(html) {
        // Simple reveal effect instead of character-by-character for HTML content
        this.codeElement.style.opacity = '0';
        
        setTimeout(() => {
            this.codeElement.style.transition = 'opacity 0.5s ease';
            this.codeElement.style.opacity = '1';
        }, 200);
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new SpotlightEffect();
    new RevealAnimator();
    new CounterAnimator();
    new HorizontalTimeline();
    new DaysCounter();
    new BentoInteractions();
    new CelebrationEffect();
    new SmoothScroll();
    new HeaderScrollEffect();
    new FloatingElements();
    new CodeTypingEffect();
    
    // Add loaded class to body for initial animations
    document.body.classList.add('loaded');
    
    console.log('%c🎉 DevGenZ Celebration Loaded', 'color: #d4af37; font-size: 16px; font-weight: bold;');
    console.log('%cCelebrating Ummisalma Aminu - The Architect of DevGenZ', 'color: #8b5cf6; font-size: 12px;');
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause expensive animations
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
});
