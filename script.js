// Set Year
document.getElementById('year').textContent = new Date().getFullYear();

// 1. Intersection Observer (Scroll Reveal)
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
});

// 2. Project Filters 
const filterBtns = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Reset active state
        filterBtns.forEach(b => {
            b.classList.remove('bg-primary', 'text-dark');
            b.classList.add('bg-white', 'text-gray-600');
        });
        
        // Set active state
        btn.classList.remove('bg-white', 'text-gray-600');
        btn.classList.add('bg-primary', 'text-dark');

        const filterValue = btn.getAttribute('data-filter');

        projectItems.forEach(item => {
            const categories = item.getAttribute('data-category').split(' ');
            
            if (filterValue === 'all' || categories.includes(filterValue)) {
                item.classList.remove('hidden');
                // Timeout to let DOM register removal of hidden before animating opacity
                setTimeout(() => {
                    item.classList.remove('opacity-0', 'scale-95');
                    item.classList.add('opacity-100', 'scale-100');
                }, 50);
            } else {
                item.classList.add('opacity-0', 'scale-95');
                item.classList.remove('opacity-100', 'scale-100');
                // Timeout matching CSS transition duration before hiding completely
                setTimeout(() => {
                    item.classList.add('hidden');
                }, 500); 
            }
        });
    });
});

// 3. Stacked Cards Animation Logic
const cardStack = document.getElementById('card-stack');
let isAnimating = false;

function updateStackStyles() {
    if (!cardStack) return;
    const cards = Array.from(cardStack.querySelectorAll('.stacked-card'));
    const total = cards.length;
    
    cards.forEach((card, i) => {
        const reverseIndex = total - 1 - i;
        
        // Mengatur event pointer: Foto bisa dizoom/klik jika di depan. Teks/bawah bisa diklik untuk slide.
        const cardBody = card.querySelector('.card-body');
        const zoomBtn = card.querySelector('.zoom-btn');
        
        if (cardBody) cardBody.style.pointerEvents = reverseIndex === 0 ? 'auto' : 'none';
        if (zoomBtn) zoomBtn.style.pointerEvents = reverseIndex === 0 ? 'auto' : 'none';
        
        const translateY = reverseIndex * 20; 
        const scale = 1 - (reverseIndex * 0.05); 
        
        card.style.transform = `translateY(${translateY}px) scale(${scale})`;
        card.style.zIndex = i; 
        card.style.opacity = reverseIndex > 2 ? 0 : 1; 
    });
}

// Setup awal
updateStackStyles();

// Event listener klik pada tumpukan kartu untuk MENGGESER (berlaku hanya untuk area card-body)
if (cardStack) {
    cardStack.addEventListener('click', (e) => {
        if (isAnimating) return;
        
        // Pastikan yang diklik adalah bagian card-body (putih bawah) bukan foto atas
        const clickedBody = e.target.closest('.card-body');
        if (!clickedBody) return; 

        const cards = Array.from(cardStack.querySelectorAll('.stacked-card'));
        if (cards.length <= 1) return; 
        
        const topCard = cards[cards.length - 1]; 

        isAnimating = true;
        topCard.classList.add('swipe-out');

        setTimeout(() => {
            topCard.style.transition = 'none';
            cardStack.prepend(topCard);
            topCard.classList.remove('swipe-out');
            void topCard.offsetWidth; 
            topCard.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease';
            updateStackStyles();
            isAnimating = false;
        }, 500); 
    });
}

// 4. Lightbox Logic (Zoom Foto)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.getElementById('close-lightbox');
const zoomBtns = document.querySelectorAll('.zoom-btn');

zoomBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah klik menyebar ke container stack yang bisa memicu slide
        const imgSrc = btn.getAttribute('data-img');
        if (imgSrc) {
            lightboxImg.src = imgSrc;
            lightbox.classList.remove('hidden');
            // Animasi fade in
            setTimeout(() => {
                lightbox.classList.remove('opacity-0');
                lightboxImg.classList.remove('scale-95');
            }, 10);
        }
    });
});

function closeLightboxHandler() {
    lightbox.classList.add('opacity-0');
    lightboxImg.classList.add('scale-95');
    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
    }, 300);
}

if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', closeLightboxHandler);
    lightbox.addEventListener('click', (e) => {
        // Tutup jika background gelap diklik (bukan fotonya)
        if (e.target === lightbox) {
            closeLightboxHandler();
        }
    });
}
