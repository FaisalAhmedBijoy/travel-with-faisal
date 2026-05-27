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
    lat:     23.3840, lng: 92.2939,
    images:  range(14).map(n => `sajek-${pad(n)}.jpg`),
  },
  {
    id:      'sreemangal',
    name:    'Sreemangal',
    country: 'Bangladesh',
    tagline: 'The Tea Capital',
    lat:     24.3070, lng: 91.7326,
    images:  range(14).map(n => `sreemangal-${pad(n)}.jpg`),
  },
  {
    id:      'meghalaya',
    name:    'Meghalaya',
    country: 'India',
    tagline: 'Abode of Clouds',
    lat:     25.5788, lng: 91.8933,
    images:  range(18).map(n => `meghalaya-${pad(n)}.jpg`),
  },
  {
    id:      'agra',
    name:    'Agra',
    country: 'India',
    tagline: 'City of the Taj Mahal',
    lat:     27.1767, lng: 78.0081,
    images:  range(8).map(n => `agra-${pad(n)}.jpg`),
  },
  {
    id:      'bandarbans',
    name:    'Bandarban',
    country: 'Bangladesh',
    tagline: 'Hills & Tribal Heritage',
    lat:     22.1953, lng: 92.2184,
    images:  ['bandarbans-01.jpg', 'bandarbans-02.png', 'bandarbans-03.jpeg'],
  },
  {
    id:      'kustia',
    name:    'Kushtia',
    country: 'Bangladesh',
    tagline: 'Land of the Baul Saints',
    lat:     23.9018, lng: 89.1257,
    images:  ['kustia-01.jpg', 'kustia-02.jpg', 'kustia-03.jpg'],
  },
  {
    id:      'coxs-bazar',
    name:    "Cox's Bazar",
    country: 'Bangladesh',
    tagline: "World's Longest Sea Beach",
    lat:     21.4272, lng: 92.0058,
    images:  ['coxs-bazar-01.jfif'],
  },
  {
    id:      'rangamati',
    name:    'Rangamati',
    country: 'Bangladesh',
    tagline: 'The Lake District',
    lat:     22.6423, lng: 92.2066,
    images:  range(15).map(n => `rangamati-${pad(n)}.jpg`),
  },
  {
    id:      'saint-martin',
    name:    'Saint Martin',
    country: 'Bangladesh',
    tagline: 'The Coral Island',
    lat:     20.6270, lng: 92.3213,
    images:  ['saint-martin-01.jpg'],
  },
  {
    id:      'sunamganj',
    name:    'Sunamganj',
    country: 'Bangladesh',
    tagline: 'Land of the Haors',
    lat:     25.0660, lng: 91.3960,
    images:  range(5).map(n => `sunamganj-${pad(n)}.jpg`),
  },
  {
    id:      'gazipur',
    name:    'Gazipur',
    country: 'Bangladesh',
    tagline: 'The Industrial Gateway',
    lat:     23.9999, lng: 90.4203,
    images:  range(16).map(n => `gazipur-${pad(n)}.jpg`),
  },
  {
    id:      'delhi',
    name:    'Delhi',
    country: 'India',
    tagline: 'Heart of India',
    lat:     28.6139, lng: 77.2090,
    images:  range(12).map(n => `delhi-${pad(n)}.jpg`),
  },
];

// ── Extra visited places (no photos yet) ──────────────────────
// Add { name, country, tagline, lat, lng } for any place you visited
// without images. They appear on the map as outlined dots.
const EXTRA_PLACES = [
  { name: 'Sylhet',     country: 'Bangladesh', tagline: 'City of Shrines',          lat: 24.8949, lng: 91.8687 },
  { name: 'Kolkata',    country: 'India',       tagline: 'City of Joy',              lat: 22.5726, lng: 88.3639 },
  { name: 'Khulna',     country: 'Bangladesh', tagline: 'Gateway to the Sundarbans', lat: 22.8456, lng: 89.5403 },
  { name: 'Kuakata',    country: 'Bangladesh', tagline: 'Daughter of the Sea',        lat: 21.8311, lng: 90.1191 },
  { name: 'Bhola',      country: 'Bangladesh', tagline: 'Land of Rivers',             lat: 22.6857, lng: 90.6481 },
  { name: 'Bogra',      country: 'Bangladesh', tagline: 'Gateway to the North',       lat: 24.8465, lng: 89.3773 },
  { name: 'Chittagong', country: 'Bangladesh', tagline: 'Port City of Bangladesh',    lat: 22.3569, lng: 91.7832 },
  { name: 'Barisal',    country: 'Bangladesh', tagline: 'Venice of the East',         lat: 22.7010, lng: 90.3535 },
  { name: 'Rangpur',    country: 'Bangladesh', tagline: 'City of the North',          lat: 25.7439, lng: 89.2752 },
  { name: 'Cumilla',    country: 'Bangladesh', tagline: 'Land of Mainamati',          lat: 23.4607, lng: 91.1809 },
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
let leafletMap      = null;
let leafletTile     = null;

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHero();
  buildHeroDots();
  buildDestinations();
  buildFilters();
  renderPhotos();
  buildMap();
  initLightbox();
  initNavbar();
  initScrollReveal();
  initBackToTop();
  startHeroSlideshow();
  initProgressBar();
  initCounters();
  initActiveNav();
  initThemeSwitcher();
  initContactForm();
});

// ── Theme Switcher ─────────────────────────────────────────
function initThemeSwitcher() {
  const savedTheme = localStorage.getItem('twf-theme') || 'dark';
  syncThemeUI(savedTheme);

  const toggleBtn = $('themeToggleBtn');
  const panel     = $('themePanel');

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    const opening = panel.hidden;
    panel.hidden  = !opening;
    toggleBtn.setAttribute('aria-expanded', String(opening));
  });

  document.addEventListener('click', () => {
    panel.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  });
  panel.addEventListener('click', e => e.stopPropagation());

  document.querySelectorAll('.theme-option, .drawer-theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      panel.hidden = true;
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function applyTheme(theme) {
  document.documentElement.classList.add('theme-changing');
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('twf-theme', theme);
  syncThemeUI(theme);
  updateMapTiles();
  setTimeout(() => document.documentElement.classList.remove('theme-changing'), 300);
}

function syncThemeUI(theme) {
  document.querySelectorAll('.theme-option, .drawer-theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function mapTileUrl() {
  return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
}

function updateMapTiles() {
  if (!leafletMap || !leafletTile) return;
  leafletTile.remove();
  leafletTile = L.tileLayer(mapTileUrl(), {
    attribution: 'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>',
    maxZoom: 18,
  }).addTo(leafletMap);
}

// ── Travel Map ─────────────────────────────────────────────
function buildMap() {
  if (!window.L) return;
  const mapEl = document.getElementById('travelMap');
  if (!mapEl) return;

  const totalPlaces = DESTINATIONS.length + EXTRA_PLACES.length;
  const subtitle = document.getElementById('mapSubtitle');
  if (subtitle) subtitle.textContent = `${totalPlaces} destination${totalPlaces !== 1 ? 's' : ''} explored`;

  leafletMap = L.map('travelMap', { zoomControl: true, scrollWheelZoom: false });
  const map = leafletMap;

  leafletTile = L.tileLayer(mapTileUrl(), {
    attribution: 'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>',
    maxZoom: 18,
  }).addTo(map);

  const bounds = [];

  const withPhotoStyle = {
    radius: 9, fillColor: '#c8a96a', color: '#0d0d0d',
    weight: 2, opacity: 1, fillOpacity: 0.9,
  };
  const noPhotoStyle = {
    radius: 10, fillColor: '#6abf7a', color: '#6abf7a',
    weight: 2.5, opacity: 1, fillOpacity: 0.25, dashArray: '5 4',
  };

  DESTINATIONS.forEach(dest => {
    if (dest.lat == null) return;
    const count = dest.images.length;
    const photoLine = `<span class="mp-photos">${count} photo${count !== 1 ? 's' : ''}</span>`;
    L.circleMarker([dest.lat, dest.lng], withPhotoStyle)
      .bindPopup(popupHtml(dest.name, dest.country, dest.tagline, photoLine), { className: 'twf-popup', maxWidth: 220 })
      .addTo(map);
    bounds.push([dest.lat, dest.lng]);
  });

  EXTRA_PLACES.forEach(place => {
    if (place.lat == null) return;
    const photoLine = `<span class="mp-photos mp-no-photos">No photos yet</span>`;
    L.circleMarker([place.lat, place.lng], noPhotoStyle)
      .bindPopup(popupHtml(place.name, place.country, place.tagline, photoLine), { className: 'twf-popup', maxWidth: 220 })
      .addTo(map);
    bounds.push([place.lat, place.lng]);
  });

  if (bounds.length > 0) map.fitBounds(bounds, { padding: [48, 48] });

  // Force a re-render in case the container had a sizing quirk on init
  setTimeout(() => map.invalidateSize(), 200);
}

function popupHtml(name, country, tagline, photoLine) {
  return `<div class="mp-inner"><strong class="mp-name">${name}</strong><span class="mp-country">${country}</span><span class="mp-tagline">${tagline}</span>${photoLine}</div>`;
}

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
    $('slideNum').textContent  = slides[heroSlideIndex].dataset.num;
    $('slideName').textContent = slides[heroSlideIndex].dataset.name;
    syncDots(heroSlideIndex);
  }, 5500);
}

function syncDots(index) {
  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    const active = i === index;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function buildHeroDots() {
  const hero = document.querySelector('.hero');
  const container = document.createElement('div');
  container.className = 'hero-dots';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Slideshow navigation');

  DESTINATIONS.forEach((dest, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `${dest.name} — slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goToSlide(i));
    container.appendChild(dot);
  });

  hero.appendChild(container);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  slides[heroSlideIndex].classList.remove('active');
  heroSlideIndex = index;
  slides[heroSlideIndex].classList.add('active');
  $('slideNum').textContent  = slides[heroSlideIndex].dataset.num;
  $('slideName').textContent = slides[heroSlideIndex].dataset.name;
  syncDots(heroSlideIndex);
  clearInterval(heroTimer);
  startHeroSlideshow();
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
    : `${ALL_PHOTOS.length} photos across ${DESTINATIONS.length} destinations`;

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
    item.className = 'photo-item skeleton';
    item.setAttribute('role', 'listitem');

    const img = document.createElement('img');
    img.alt     = `Photo from ${photo.destName}`;
    img.loading = 'lazy';
    img.onload  = () => item.classList.remove('skeleton');
    img.onerror = () => item.classList.remove('skeleton');
    img.src     = photo.src;

    item.innerHTML += `
      <div class="photo-item-overlay" aria-hidden="true">
        <span class="photo-item-label">${photo.destName}</span>
      </div>
      <div class="photo-item-expand" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </div>
    `;
    item.insertBefore(img, item.firstChild);

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

  // Share button
  const shareBtn = $('lbShare');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const photo = lbPhotos[lbIndex];
      const url   = window.location.origin + '/' + photo.src;
      if (navigator.share) {
        try {
          await navigator.share({ title: `Travel with Faisal — ${photo.destName}`, url });
        } catch (_) { /* user cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          shareBtn.title = 'Link copied!';
          setTimeout(() => { shareBtn.title = ''; }, 2000);
        } catch (_) {}
      }
    });
  }
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

  const dl = $('lbDownload');
  if (dl) {
    dl.href     = photo.src;
    dl.download = photo.src.split('/').pop();
  }

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

// ── Scroll Progress Bar ───────────────────────────────────
function initProgressBar() {
  const bar = $('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    bar.style.width = (window.scrollY / max * 100) + '%';
  }, { passive: true });
}

// ── Animated Stat Counters ─────────────────────────────────
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.textContent.replace(/\D/g, ''), 10);
      if (isNaN(target) || target === 0) return;
      animateCount(el, target);
      obs.unobserve(el);
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('.stat strong').forEach(el => obs.observe(el));
}

function animateCount(el, target) {
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Active Nav Section ─────────────────────────────────────
function initActiveNav() {
  const ids = ['destinations', 'map', 'gallery', 'about'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const links    = document.querySelectorAll('.nav-links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  sections.forEach(s => obs.observe(s));
}

// ── Contact Form ───────────────────────────────────────────
function initContactForm() {
  const form     = $('contactForm');
  const feedback = $('formFeedback');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name  = form.querySelector('#cf-name');
    const email = form.querySelector('#cf-email');
    const dest  = form.querySelector('#cf-dest');
    const msg   = form.querySelector('#cf-msg');
    let   valid = true;

    [name, email, msg].forEach(el => {
      el.classList.remove('invalid');
      if (!el.value.trim()) { el.classList.add('invalid'); valid = false; }
    });
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('invalid');
      valid = false;
    }

    if (!valid) {
      showFeedback(feedback, 'Please fill in all required fields correctly.', false);
      return;
    }

    const subject = `Travel Together — ${dest.value.trim() || 'Adventure'}`;
    const body    = `Hi Faisal,\n\nName: ${name.value.trim()}\nEmail: ${email.value.trim()}\nDestination: ${dest.value.trim() || 'TBD'}\n\n${msg.value.trim()}`;
    window.location.href = `mailto:faisal.cse16.kuet@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showFeedback(feedback, 'Opening your email client… Thanks for reaching out!', true);
    form.reset();
  });

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('invalid'));
  });
}

function showFeedback(el, message, success) {
  el.textContent = message;
  el.className   = 'form-feedback ' + (success ? 'success' : 'error');
  el.hidden      = false;
  setTimeout(() => { el.hidden = true; }, 5000);
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
