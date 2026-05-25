'use strict';

/* ============================================================
   Travel with Faisal — Gallery JS
   Handles: hero slideshow, destinations, masonry filter,
            lightbox, scroll-reveal, navbar, back-to-top
   ============================================================ */

// ── Helpers ────────────────────────────────────────────────
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
const pad   = (n) => String(n).padStart(2, '0');
const $     = (id) => document.getElementById(id);

// ── Data ───────────────────────────────────────────────────
const DESTINATIONS = [
  {
    id:      'sajek',
    name:    'Sajek Valley',
    country: 'Bangladesh',
    tagline: 'Queen of the Hills',
    images:  range(14).map(n => `sajek-${pad(n)}.jpg`),
  },
  {
    id:      'sreemangal',
    name:    'Sreemangal',
    country: 'Bangladesh',
    tagline: 'The Tea Capital',
    images:  range(14).map(n => `sreemangal-${pad(n)}.jpg`),
  },
  {
    id:      'meghalaya',
    name:    'Meghalaya',
    country: 'India',
    tagline: 'Abode of Clouds',
    images:  range(12).map(n => `meghalaya-${pad(n)}.jpg`),
  },
  {
    id:      'agra',
    name:    'Agra',
    country: 'India',
    tagline: 'City of the Taj Mahal',
    images:  range(6).map(n => `agra-${pad(n)}.jpg`),
  },
  {
    id:      'bandarbans',
    name:    'Bandarban',
    country: 'Bangladesh',
    tagline: 'Hills & Tribal Heritage',
    images:  ['bandarbans-01.jpg', 'bandarbans-02.png', 'bandarbans-03.jpeg'],
  },
  {
    id:      'kustia',
    name:    'Kushtia',
    country: 'Bangladesh',
    tagline: 'Land of the Baul Saints',
    images:  ['kustia-01.jpg', 'kustia-02.jpg'],
  },
  {
    id:      'coxs-bazar',
    name:    "Cox's Bazar",
    country: 'Bangladesh',
    tagline: "World's Longest Sea Beach",
    images:  ['coxs-bazar-01.jfif'],
  },
  {
    id:      'rangamati',
    name:    'Rangamati',
    country: 'Bangladesh',
    tagline: 'The Lake District',
    images:  ['rangamati-01.jpeg'],
  },
  {
    id:      'saint-martin',
    name:    'Saint Martin',
    country: 'Bangladesh',
    tagline: 'The Coral Island',
    images:  ['saint-martin-01.jpg'],
  },
];

// Flat list: { src, destId, destName }
const ALL_PHOTOS = DESTINATIONS.flatMap(dest =>
  dest.images.map(file => ({
    src:      `images/${dest.id}/${file}`,
    destId:   dest.id,
    destName: dest.name,
  }))
);

// ── State ──────────────────────────────────────────────────
const PAGE_SIZE     = 24;
let currentFilter   = 'all';
let loadedCount     = PAGE_SIZE;
let heroSlideIndex  = 0;
let heroTimer       = null;
let lbPhotos        = [];
let lbIndex         = 0;
let touchStartX     = null;

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHero();
  buildDestinations();
  buildFilters();
  renderPhotos();
  initLightbox();
  initNavbar();
  initScrollReveal();
  initBackToTop();
  startHeroSlideshow();
});

// ── Hero Slideshow ─────────────────────────────────────────
function buildHero() {
  const bg = $('heroBg');
  DESTINATIONS.forEach((dest, i) => {
    const slide = document.createElement('div');
    slide.className  = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url(images/${dest.id}/${dest.images[0]})`;
    slide.dataset.name = dest.name;
    slide.dataset.num  = pad(i + 1);
    bg.appendChild(slide);
  });
}

function startHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;

  heroTimer = setInterval(() => {
    slides[heroSlideIndex].classList.remove('active');
    heroSlideIndex = (heroSlideIndex + 1) % slides.length;
    slides[heroSlideIndex].classList.add('active');
    $('slideNum').textContent = slides[heroSlideIndex].dataset.num;
    $('slideName').textContent = slides[heroSlideIndex].dataset.name;
  }, 5500);
}

// ── Destinations Grid ──────────────────────────────────────
function buildDestinations() {
  const grid = $('destGrid');
  DESTINATIONS.forEach(dest => {
    const card = document.createElement('article');
    card.className   = 'dest-card reveal';
    card.tabIndex    = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Filter gallery by ${dest.name}`);
    card.innerHTML = `
      <img class="dest-card-img"
           src="images/${dest.id}/${dest.images[0]}"
           alt="${dest.name}, ${dest.country}"
           loading="lazy">
      <div class="dest-card-overlay" aria-hidden="true"></div>
      <div class="dest-card-body">
        <p class="dest-card-country">${dest.country}</p>
        <h3 class="dest-card-name">${dest.name}</h3>
        <p class="dest-card-tagline">${dest.tagline}</p>
      </div>
      <span class="dest-card-count">${dest.images.length} photo${dest.images.length > 1 ? 's' : ''}</span>
    `;
    const activate = () => {
      filterBy(dest.id);
      document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    grid.appendChild(card);
  });
}

// ── Gallery Filter ─────────────────────────────────────────
function buildFilters() {
  const row = $('filterRow');

  const allBtn = makeFilterBtn('all', `All (${ALL_PHOTOS.length})`, true);
  row.appendChild(allBtn);

  DESTINATIONS.forEach(dest => {
    row.appendChild(makeFilterBtn(dest.id, dest.name, false));
  });
}

function makeFilterBtn(filter, label, active) {
  const btn = document.createElement('button');
  btn.className   = 'filter-btn' + (active ? ' active' : '');
  btn.textContent = label;
  btn.dataset.filter = filter;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', active ? 'true' : 'false');
  btn.addEventListener('click', () => filterBy(filter));
  return btn;
}

function filterBy(filter) {
  currentFilter = filter;
  loadedCount   = PAGE_SIZE;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const count = filter === 'all'
    ? ALL_PHOTOS.length
    : ALL_PHOTOS.filter(p => p.destId === filter).length;
  const dest  = DESTINATIONS.find(d => d.id === filter);
  $('galleryCount').textContent = dest
    ? `${count} photo${count > 1 ? 's' : ''} from ${dest.name}`
    : `${count} photos across 9 destinations`;

  renderPhotos();
}

// ── Render Photo Grid ──────────────────────────────────────
function renderPhotos() {
  const grid       = $('masonryGrid');
  const loadMoreRow = $('loadMoreRow');

  const visible = currentFilter === 'all'
    ? ALL_PHOTOS
    : ALL_PHOTOS.filter(p => p.destId === currentFilter);

  const slice = visible.slice(0, loadedCount);

  grid.innerHTML = '';

  slice.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.setAttribute('role', 'listitem');
    item.innerHTML = `
      <img src="${photo.src}" alt="Photo from ${photo.destName}" loading="lazy">
      <div class="photo-item-overlay" aria-hidden="true">
        <span class="photo-item-label">${photo.destName}</span>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(visible, i));
    item.tabIndex = 0;
    item.setAttribute('aria-label', `Open photo from ${photo.destName}`);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(visible, i); }
    });
    grid.appendChild(item);

    // Staggered fade-in
    const delay = Math.min(i, 20) * 40;
    setTimeout(() => requestAnimationFrame(() => item.classList.add('visible')), delay);
  });

  loadMoreRow.hidden = visible.length <= loadedCount;
}

$('loadMoreBtn').addEventListener('click', () => {
  loadedCount += PAGE_SIZE;
  renderPhotos();
});

// ── Lightbox ───────────────────────────────────────────────
function initLightbox() {
  $('lbClose').addEventListener('click', closeLightbox);
  $('lbBackdrop').addEventListener('click', closeLightbox);
  $('lbPrev').addEventListener('click', () => navigateLb(-1));
  $('lbNext').addEventListener('click', () => navigateLb(1));

  document.addEventListener('keydown', e => {
    if ($('lightbox').hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigateLb(-1);
    if (e.key === 'ArrowRight') navigateLb(1);
  });

  // Touch swipe
  const lb = $('lightbox');
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) navigateLb(dx < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });
}

function openLightbox(photos, index) {
  lbPhotos = photos;
  lbIndex  = index;
  showLbPhoto();
  $('lightbox').hidden = false;
  document.body.style.overflow = 'hidden';

  // Stop hero slideshow while lightbox is open
  clearInterval(heroTimer);
}

function closeLightbox() {
  $('lightbox').hidden = true;
  document.body.style.overflow = '';
  startHeroSlideshow();
}

function navigateLb(dir) {
  lbIndex = (lbIndex + dir + lbPhotos.length) % lbPhotos.length;

  // Brief fade between images
  const img = $('lbImg');
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.2s';
  setTimeout(() => {
    showLbPhoto();
    img.style.opacity = '1';
  }, 160);
}

function showLbPhoto() {
  const photo = lbPhotos[lbIndex];
  const img   = $('lbImg');
  img.src    = photo.src;
  img.alt    = `Photo from ${photo.destName}`;
  img.style.opacity  = '1';
  img.style.transition = '';

  $('lbLocation').textContent = photo.destName;
  $('lbCounter').textContent  = `${lbIndex + 1} / ${lbPhotos.length}`;

  const multiPhoto = lbPhotos.length > 1;
  $('lbPrev').style.display = multiPhoto ? '' : 'none';
  $('lbNext').style.display = multiPhoto ? '' : 'none';
}

// ── Navbar ─────────────────────────────────────────────────
function initNavbar() {
  const navbar = $('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const hamburger = $('hamburger');
  const drawer    = $('navDrawer');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('open', open);
  });

  // Close drawer on any drawer-link click
  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('open');
    });
  });
}

// ── Scroll Reveal ──────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Observe existing .reveal elements (section headers)
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Also observe destination cards once they're in the DOM
  // (cards are added with .reveal class, so they're picked up above
  //  if buildDestinations runs before initScrollReveal — which it does)
}

// ── Back to Top ────────────────────────────────────────────
function initBackToTop() {
  const btn = $('backToTop');

  window.addEventListener('scroll', () => {
    // Use hidden attribute trick: remove hidden to show (opacity transition via CSS)
    if (window.scrollY > 500) {
      btn.hidden = false;
    } else {
      btn.hidden = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
