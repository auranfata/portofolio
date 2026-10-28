// ISI DENGAN CREDENTIALS SUPABASE ANDA
const SUPABASE_URL = 'https://bagfttjjnztaoiklxbql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ2Z0dGpqbnp0YW9pa2x4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODUyMDksImV4cCI6MjEwODc2MTIwOX0.zrNFCOkor_8CTBp8M90PYex3OCkTEWWFTWSc6b2frio';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Set Year
document.getElementById('year').textContent = new Date().getFullYear();

// 1. Fungsi Utama Mengambil Proyek dari Supabase
async function fetchAndRenderProjects() {
    const projectGrid = document.getElementById('project-grid');
    const loadingState = document.getElementById('loading-projects');
    const filterContainer = document.getElementById('filter-container');
    
    // Matikan tombol filter saat loading
    filterContainer.style.pointerEvents = 'none';
    filterContainer.style.opacity = '0.5';

    try {
        const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Hilangkan loading text
        loadingState.classList.add('hidden');

        if (projects.length === 0) {
            projectGrid.innerHTML = '<p class="text-center text-gray-500 py-10 col-span-full">Belum ada proyek yang diunggah.</p>';
            return;
        }

        // Render setiap proyek
        projectGrid.innerHTML = ''; 
        projects.forEach((project, index) => {
            // Berikan delay bertahap untuk animasi reveal
            const delayClass = index % 3 === 1 ? 'delay-100' : (index % 3 === 2 ? 'delay-200' : '');
            
            // Konversi kategori (misal: 'webapp' -> 'Website', 'gis' -> 'WebGIS', 'mobile' -> 'PWA')
            let badgeText = 'Project';
            if(project.category.includes('webapp')) badgeText = 'Website';
            if(project.category.includes('gis')) badgeText = 'WebGIS';
            if(project.category.includes('mobile')) badgeText = 'PWA';

            const cardHTML = `
                <div class="project-item reveal transform transition-all duration-500 ease-in-out ${delayClass}" data-category="${project.category}">
                    <div class="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col group">
                        <div class="w-full h-56 bg-gray-200 overflow-hidden relative">
                            <img src="${project.image_url}" alt="${project.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur text-xs font-semibold rounded-full text-dark shadow-sm">${badgeText}</span>
                        </div>
                        <div class="p-6 flex-grow flex flex-col">
                            <h3 class="text-xl font-bold text-dark mb-2">${project.title}</h3>
                            <p class="text-gray-500 text-sm mb-4 flex-grow">${project.description}</p>
                            <a href="${project.project_link}" target="_blank" class="text-primaryHover font-bold text-sm inline-flex items-center group-hover:underline">Detail Project &rarr;</a>
                        </div>
                    </div>
                </div>
            `;
            projectGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Trigger Intersection Observer untuk elemen yang baru dirender
        initScrollReveal();
        
        // Aktifkan kembali logika filter
        filterContainer.style.pointerEvents = 'auto';
        filterContainer.style.opacity = '1';
        initFilters();

    } catch (error) {
        console.error('Error loading projects:', error);
        loadingState.innerHTML = '<span class="text-red-500">Gagal memuat proyek. Silakan refresh halaman.</span>';
    }
}

// 2. Intersection Observer (Scroll Reveal)
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
}

// 3. Project Filters Logic
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        // Hapus event listener lama jika ada (mencegah duplicate fire)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            // Reset active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-dark');
                b.classList.add('bg-white', 'text-gray-600');
            });
            
            // Set active state
            newBtn.classList.remove('bg-white', 'text-gray-600');
            newBtn.classList.add('bg-primary', 'text-dark');

            const filterValue = newBtn.getAttribute('data-filter');

            projectItems.forEach(item => {
                const categories = item.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.classList.remove('opacity-0', 'scale-95');
                        item.classList.add('opacity-100', 'scale-100');
                    }, 50);
                } else {
                    item.classList.add('opacity-0', 'scale-95');
                    item.classList.remove('opacity-100', 'scale-100');
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 500); 
                }
            });
        });
    });
}

// 4. Stacked Cards Animation Logic
const cardStack = document.getElementById('card-stack');
let isAnimating = false;

function updateStackStyles() {
    if (!cardStack) return;
    const cards = Array.from(cardStack.querySelectorAll('.stacked-card'));
    const total = cards.length;
    
    cards.forEach((card, i) => {
        const reverseIndex = total - 1 - i;
        
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

// Setup awal Stacked Cards
updateStackStyles();

if (cardStack) {
    cardStack.addEventListener('click', (e) => {
        if (isAnimating) return;
        
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

// 5. Lightbox Logic (Zoom Foto)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.getElementById('close-lightbox');
const zoomBtns = document.querySelectorAll('.zoom-btn');

zoomBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = btn.getAttribute('data-img');
        if (imgSrc) {
            lightboxImg.src = imgSrc;
            lightbox.classList.remove('hidden');
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
        if (e.target === lightbox) closeLightboxHandler();
    });
}

// JALANKAN SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal(); // Setup reveal untuk elemen non-dinamis (Hero, About, dll)
    fetchAndRenderProjects(); // Tarik data dari Supabase
});