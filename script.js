// ============================================================
// Paisley Roofing - Script (Native Scroll, No Lenis)
// ============================================================

// Intersection Observer for scroll reveals
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: window.innerWidth <= 768 ? 0.05 : 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Play once
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => observer.observe(el));
});

// Modal Logic
const modal = document.getElementById('quote-modal');
const modalContent = modal.querySelector('.modal-content');

function toggleModal() {
    const isOpening = modal.classList.contains('hidden');
    
    if (isOpening) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        });
    } else {
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

// Nav Scroll Logic
let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.classList.remove('-translate-y-full', 'glass-nav', 'text-black', 'shadow-sm');
        nav.classList.add('bg-transparent', 'text-white');
        return;
    }
    
    nav.classList.add('glass-nav', 'text-black', 'shadow-sm');
    nav.classList.remove('bg-transparent', 'text-white');

    if (currentScroll > lastScroll && currentScroll > 150) {
        nav.classList.add('-translate-y-full');
    } else {
        nav.classList.remove('-translate-y-full');
    }
    
    lastScroll = currentScroll;
});

// Anchor links with native smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    });
});

// Scrubbable Video Canvas Logic (Restored)
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const frameCount = 151;
const currentFrame = index => `assets/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
const images = [];
let loadedCount = 0;

let targetFrameIndex = 1;
let currentFrameIndex = 1;
let currentScrollFraction = 0;
let targetScrollFraction = 0;

// Preload images
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
    img.onload = () => {
        loadedCount++;
        if(i === 1) render(1);
    };
}

function render(frameIndex) {
    const img = images[frameIndex - 1];
    if(img && img.complete && img.naturalHeight !== 0 && canvas && context) {
        // Use physical pixels for rendering
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Object-fit: cover logic
        const scale = Math.max(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight);
        
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        
        const x = Math.floor((canvasWidth - drawWidth) / 2);
        const y = Math.floor((canvasHeight - drawHeight) / 2);
        
        // Force high-fidelity rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, drawWidth, drawHeight);
    }
}

function updateHeroAnimation() {
    const stickyContainer = document.querySelector('.hero-sticky-container');
    if (!stickyContainer) return;
    
    const rect = stickyContainer.getBoundingClientRect();
    const scrolled = -rect.top;
    const maxScroll = stickyContainer.offsetHeight - window.innerHeight;
    
    let fraction = 0;
    if (maxScroll > 0) {
        fraction = scrolled / maxScroll;
    }
    
    targetScrollFraction = Math.min(Math.max(fraction, 0), 1);
    targetFrameIndex = Math.min(frameCount, Math.max(1, Math.floor(targetScrollFraction * (frameCount - 1)) + 1));
}

// Custom Smooth Lerp Loop (Apple/GSAP Physics) for Canvas & Text
const heroContent = document.getElementById('hero-content');

function animationLoop() {
    // Smooth frame transitions
    const lerpFactor = window.innerWidth <= 768 ? 0.25 : 0.12;
    if (Math.abs(targetFrameIndex - currentFrameIndex) > 0.05) {
        currentFrameIndex += (targetFrameIndex - currentFrameIndex) * lerpFactor; 
        render(Math.round(currentFrameIndex));
    } else if (currentFrameIndex !== targetFrameIndex) {
        currentFrameIndex = targetFrameIndex;
        render(Math.round(currentFrameIndex));
    }

    // Smooth text parallax/fade
    if (Math.abs(targetScrollFraction - currentScrollFraction) > 0.001) {
        currentScrollFraction += (targetScrollFraction - currentScrollFraction) * lerpFactor;
        if (heroContent) {
            heroContent.style.transform = `translateY(${currentScrollFraction * -20}%) scale(${1 - currentScrollFraction * 0.05})`;
            heroContent.style.opacity = 1 - (currentScrollFraction * 1.8);
        }
    }

    requestAnimationFrame(animationLoop);
}
requestAnimationFrame(animationLoop);

window.addEventListener('scroll', updateHeroAnimation);

function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    updateHeroAnimation();
    if (typeof currentFrameIndex !== 'undefined') {
        render(Math.round(currentFrameIndex));
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mobile: adjust hero container height dynamically
function adjustHeroForMobile() {
    const stickyContainer = document.querySelector('.hero-sticky-container');
    if (!stickyContainer) return;
    if (window.innerWidth <= 768) {
        // One-swipe exit on mobile: 102vh total
        stickyContainer.style.height = '102vh';
    } else {
        stickyContainer.style.height = '250vh';
    }
}
adjustHeroForMobile();
window.addEventListener('resize', adjustHeroForMobile);

// Mobile Menu Toggle
function toggleMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    if (!overlay) return;
    const isOpen = overlay.style.opacity === '1';
    if (!isOpen) {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
        document.body.style.overflow = 'hidden';
    } else {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    }
}

// YouTube API Players
let players = {};

function onYouTubeIframeAPIReady() {
    // About Section Player (Background loop)
    players['about'] = new YT.Player('player-about', {
        videoId: 'yB0Wj-no_fc',
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'controls': 0,
            'loop': 1,
            'playlist': 'yB0Wj-no_fc',
            'modestbranding': 1,
            'showinfo': 0,
            'rel': 0,
            'playsinline': 1
        },
        events: {
            'onReady': (event) => {
                event.target.mute();
                event.target.playVideo();
                // Ensure it plays even if restricted
                const playPromise = event.target.playVideo();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Retry on interaction if needed (though muted usually works)
                        console.log("Autoplay blocked, waiting for interaction");
                    });
                }
            }
        }
    });

    // Showcase Player
    players['showcase'] = new YT.Player('player-showcase', {
        videoId: 'yB0Wj-no_fc',
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'controls': 0,
            'loop': 1,
            'playlist': 'yB0Wj-no_fc',
            'modestbranding': 1,
            'rel': 0,
            'playsinline': 1
        },
        events: {
            'onReady': (event) => {
                event.target.mute();
                event.target.playVideo();
            }
        }
    });
}

// Map the global YouTube callback if the script is already loaded
if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
} else {
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}
