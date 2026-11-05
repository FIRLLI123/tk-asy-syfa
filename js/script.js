/* tema awal: pilihan tersimpan, lalu pengaturan perangkat */
(function(){
  var t = null;
  try { t = localStorage.getItem('asysyifa-theme'); } catch(e){}
  var r = document.documentElement;
  if (!t) t = r.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  r.setAttribute('data-theme', t);
})();

/* ============================================================
   PENGATURAN SEKOLAH. Ubah bagian ini saja.
   ============================================================ */
const CONFIG = {
  wa: '',                                   // nomor WhatsApp format 628xxxxxxxxxx (tanpa + dan spasi)
  waTampil: '0812-xxxx-xxxx',               // nomor yang ditampilkan di halaman
  waText: 'Assalamualaikum, saya ingin bertanya tentang pendaftaran TK ISLAM ASY-SYIFA.',
  alamat: 'Alamat lengkap TK ISLAM ASY-SYIFA',
  jam: 'Senin sampai Jumat, pukul 07.30 sampai 10.45 WIB',
  instagram: ''                             // contoh: 'tkasysyifa' (tanpa @). Kosongkan jika belum ada.
};

/* ============================================================
   FOTO DOKUMENTASI. Isi src dengan alamat file foto Anda,
   contoh: 'foto/belajar-iqro.jpg'. Kosong = tampil kotak warna.
   ============================================================ */
const FOTO = {
  hero1:  { src: '', alt: 'Anak-anak bermain di halaman' },
  hero2:  { src: '', alt: 'Belajar Iqro' },
  hero3:  { src: '', alt: 'Mewarnai bersama' },
  hero4:  { src: '', alt: 'Sholat dhuha' },
  tentang:{ src: '', alt: 'Guru dan murid di kelas' },
  sehari: { src: '', alt: 'Suasana pagi di sekolah' },
  galeri: [
    { src: '', alt: 'Belajar Iqro bersama',       kat: 'Belajar' },
    { src: '', alt: 'Sholat dhuha berjamaah',     kat: 'Ibadah'  },
    { src: '', alt: 'Bermain di halaman',         kat: 'Bermain' },
    { src: '', alt: 'Mewarnai dan menempel',      kat: 'Belajar' },
    { src: '', alt: 'Manasik haji mini',          kat: 'Acara'   },
    { src: '', alt: 'Pentas seni akhir tahun',    kat: 'Acara'   },
    { src: '', alt: 'Belajar adab makan',         kat: 'Belajar' },
    { src: '', alt: 'Kunjungan ke luar sekolah',  kat: 'Acara'   },
    { src: '', alt: 'Hafalan doa bersama',        kat: 'Ibadah'  },
    { src: '', alt: 'Bermain balok dan puzzle',   kat: 'Bermain' },
    { src: '', alt: 'Berkebun di sekolah',        kat: 'Bermain' },
    { src: '', alt: 'Wisuda dan perpisahan',      kat: 'Acara'   }
  ]
};

/* ---------------- kode halaman ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const COLORS = ['sky','sun','leaf','coral','grape'];

function fill(el, item, i) {
  const c = COLORS[i % COLORS.length];
  el.style.setProperty('--c', c === 'sky' ? 'var(--sky-deep)' : 'var(--' + c + ')');
  el.style.setProperty('--cs', 'var(--' + c + '-soft)');
  const ph = () => {
    el.innerHTML = '<div class="ph"><svg class="ic"><use href="#i-camera"/></svg><b>Foto dokumentasi</b><small>' + esc(item.alt) + '</small></div>';
  };
  el.innerHTML = '';
  if (item.src) {
    const img = new Image();
    img.alt = item.alt; img.decoding = 'async'; img.loading = 'lazy';
    img.onerror = ph;
    img.src = item.src;
    el.appendChild(img);
  } else ph();
}

/* foto hero, tentang, sehari */
['hero1','hero2','hero3','hero4','tentang','sehari'].forEach((k, i) => {
  const el = $('[data-foto="' + k + '"]');
  if (el) fill(el, FOTO[k], i);
});

/* galeri */
const ROT = ['-2deg','1.5deg','-1deg','2deg'];
const grid = $('#grid');
FOTO.galeri.forEach((f, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'g rv';
  b.dataset.kat = f.kat;
  b.dataset.i = i;
  b.style.setProperty('--r', ROT[i % 4]);
  b.style.setProperty('--d', (i % 4) * 0.08 + 's');
  b.setAttribute('aria-label', 'Lihat foto: ' + f.alt);
  b.innerHTML = '<span class="tag">' + esc(f.kat) + '</span><div class="slot"></div><span class="cap">' + esc(f.alt) + '</span>';
  fill($('.slot', b), f, i + 2);
  b.addEventListener('click', () => openLb(i));
  grid.appendChild(b);
});

/* filter galeri */
let filterTimer;
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.setAttribute('aria-pressed', x === t ? 'true' : 'false'));
  const kat = t.dataset.kat;
  const items = $$('.g');
  items.forEach(g => g.classList.add('fade'));
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    items.forEach(g => { g.hidden = !(kat === 'semua' || g.dataset.kat === kat); });
    requestAnimationFrame(() => items.forEach(g => g.classList.remove('fade')));
  }, 230);
}));

/* lightbox */
const lb = $('#lb'), lbSlot = $('.lb-slot');
let vis = [], cur = 0, lastFocus = null;
function show(n, animate) {
  cur = (n + vis.length) % vis.length;
  const idx = vis[cur], f = FOTO.galeri[idx];
  const apply = () => {
    fill(lbSlot, f, idx + 2);
    $('#lbCap').textContent = f.alt;
    $('#lbCnt').textContent = (cur + 1) + ' / ' + vis.length;
    lbSlot.classList.remove('swap');
  };
  if (animate) { lbSlot.classList.add('swap'); setTimeout(apply, 170); } else apply();
}
function openLb(i) {
  vis = $$('.g').filter(g => !g.hidden).map(g => +g.dataset.i);
  lastFocus = document.activeElement;
  lb.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  show(vis.indexOf(i), false);
  requestAnimationFrame(() => lb.classList.add('open'));
  $('#lbX').focus();
}
function closeLb() {
  lb.classList.remove('open');
  document.documentElement.style.overflow = '';
  setTimeout(() => { lb.hidden = true; }, 280);
  if (lastFocus) lastFocus.focus();
}
$('#lbX').addEventListener('click', closeLb);
$('#lbP').addEventListener('click', () => show(cur - 1, true));
$('#lbN').addEventListener('click', () => show(cur + 1, true));
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') show(cur - 1, true);
  if (e.key === 'ArrowRight') show(cur + 1, true);
});
let tx = null;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), true);
});

/* kontak */
const waHref = CONFIG.wa ? 'https://wa.me/' + CONFIG.wa + '?text=' + encodeURIComponent(CONFIG.waText) : '#kontak';
$$('[data-wa]').forEach(a => { a.href = waHref; if (CONFIG.wa) { a.target = '_blank'; a.rel = 'noopener'; } });
$$('[data-wa-text]').forEach(p => p.textContent = CONFIG.waTampil);
$$('[data-alamat]').forEach(p => p.textContent = CONFIG.alamat);
$$('[data-jam]').forEach(p => p.textContent = CONFIG.jam);
$('#maps').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('TK ISLAM ASY-SYIFA ' + CONFIG.alamat);
if (CONFIG.instagram) {
  $('#igCard').hidden = false;
  $('[data-ig]').textContent = '@' + CONFIG.instagram;
  $('#igLink').href = 'https://instagram.com/' + CONFIG.instagram;
}
$$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const text = btn.dataset.copy === 'wa' ? CONFIG.waTampil : CONFIG.alamat;
  const label = $('span', btn), old = label.textContent;
  try { await navigator.clipboard.writeText(text); label.textContent = 'Tersalin'; }
  catch (e) {
    const r = document.createRange(); r.selectNodeContents(btn.previousElementSibling);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); label.textContent = 'Pilih lalu salin';
  }
  setTimeout(() => label.textContent = old, 1800);
}));
$('#yr').textContent = new Date().getFullYear();

/* header: bayangan saat scroll + menu mobile */
const header = $('header'), burger = $('#burger');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
});
$$('.links a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.querySelector('use').setAttribute('href', '#i-menu');
}));

/* mode terang / gelap */
const root = document.documentElement, themeBtn = $('#theme');
const mqDark = matchMedia('(prefers-color-scheme: dark)');
let savedTheme = null;
try { savedTheme = localStorage.getItem('asysyifa-theme'); } catch (e) {}
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
}
applyTheme(savedTheme || root.getAttribute('data-theme') || (mqDark.matches ? 'dark' : 'light'));
mqDark.addEventListener('change', e => { if (!savedTheme) applyTheme(e.matches ? 'dark' : 'light'); });

/* bintang kecil dan kursor */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const fx = $('#fx'), KC = ['var(--sun)','var(--coral)','var(--leaf)','var(--sky)','var(--grape)'];
function burst(x, y, n) {
  if (reduceMotion || fx.childElementCount > 40) return;
  n = n || 6;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const a = Math.random() * Math.PI * 2, d = 36 + Math.random() * 46;
    s.className = 'spark';
    s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--s:' + (10 + Math.random() * 12) + 'px;--k:' + KC[i % 5] +
      ';--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px;--rt:' + ((Math.random() * 240 - 120) | 0) + 'deg';
    s.innerHTML = '<svg><use href="#f-star"/></svg>';
    s.addEventListener('animationend', () => s.remove());
    fx.appendChild(s);
  }
}
themeBtn.addEventListener('click', e => {
  const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  savedTheme = t;
  try { localStorage.setItem('asysyifa-theme', t); } catch (err) {}
  root.classList.add('tt');
  applyTheme(t);
  setTimeout(() => root.classList.remove('tt'), 700);
  const r = themeBtn.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 9);
});
const FUN = '.card,.pillar,.step,.info,.g,.panel,.chips li,.btn,.tl .box,.tab,.theme,.about-photo,.day-side .slot,.collage .slot';
if (finePointer && !reduceMotion) {
  const cur = $('#cur');
  let x = -100, y = -100, cx = -100, cy = -100;
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    cur.classList.add('on');
    cur.classList.toggle('big', !!(e.target.closest && e.target.closest(FUN + ',a,button,summary')));
  });
  document.addEventListener('pointerdown', () => cur.classList.add('down'));
  document.addEventListener('pointerup', () => cur.classList.remove('down'));
  document.documentElement.addEventListener('mouseleave', () => cur.classList.remove('on'));
  (function loop() {
    cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
    cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    const t = e.target.closest && e.target.closest(FUN);
    if (t && !t.contains(e.relatedTarget)) burst(e.clientX, e.clientY, 6);
  });
}

/* animasi muncul saat scroll */
$$('[data-stagger]').forEach(box => [...box.children].forEach((c, i) => c.style.setProperty('--d', (i * 0.09) + 's')));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      const t = e.target;
      t.classList.add('in');
      io.unobserve(t);
      /* setelah selesai muncul, lepas kelasnya supaya efek hover bebas bergerak */
      const d = parseFloat(t.style.getPropertyValue('--d')) || 0;
      setTimeout(() => t.classList.remove('rv', 'in'), (d + 0.9) * 1000);
    }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));
} else $$('.rv').forEach(el => el.classList.add('in'));

/* ============================================================
   MUSIK LATAR BELAKANG CERIA & SISTEM AUDIO
   ============================================================ */
let bgm = null;
let bgmPlaying = false;
let isAttemptingPlay = false;

function initBgm() {
  if (bgm) return bgm;
  bgm = document.getElementById('bgmAudio') || new Audio('lagu.mp3');
  bgm.loop = true;
  bgm.volume = 0.5;
  return bgm;
}

function updateMusicUI(isPlaying) {
  const toggleBtn = document.getElementById('musicToggle');
  if (!toggleBtn) return;
  if (isPlaying) {
    toggleBtn.classList.add('playing');
    toggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    toggleBtn.classList.remove('playing');
    toggleBtn.setAttribute('aria-pressed', 'false');
  }
}

function playBgm() {
  if (bgmPlaying || isAttemptingPlay) return;
  const audio = initBgm();
  audio.volume = 0.5;
  isAttemptingPlay = true;
  const promise = audio.play();
  if (promise !== undefined) {
    promise.then(() => {
      bgmPlaying = true;
      isAttemptingPlay = false;
      updateMusicUI(true);
      removeAutoplayGuards();
      const tooltip = document.getElementById('musicTooltip');
      if (tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 3000);
      }
    }).catch(() => {
      bgmPlaying = false;
      isAttemptingPlay = false;
      updateMusicUI(false);
    });
  } else {
    isAttemptingPlay = false;
  }
}

function pauseBgm() {
  if (!bgm) return;
  bgm.pause();
  bgmPlaying = false;
  isAttemptingPlay = false;
  updateMusicUI(false);
  removeAutoplayGuards();
}

function toggleBgm() {
  if (bgmPlaying) {
    pauseBgm();
  } else {
    playBgm();
  }
}

const musicToggleBtn = document.getElementById('musicToggle');
if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBgm();
  });
}

// Handler penjaga: menangkap scroll, geser layar hp (touch scroll), roda mouse, dan ketukan
const GESTURE_EVENTS = [
  'scroll',
  'wheel',
  'touchmove',
  'touchstart',
  'touchend',
  'pointerdown',
  'pointerup',
  'click',
  'keydown'
];

function onPageInteraction() {
  if (!bgmPlaying) {
    playBgm();
  }
}

function addAutoplayGuards() {
  GESTURE_EVENTS.forEach(evt => {
    window.addEventListener(evt, onPageInteraction, { capture: true, passive: true });
    document.addEventListener(evt, onPageInteraction, { capture: true, passive: true });
  });
}

function removeAutoplayGuards() {
  GESTURE_EVENTS.forEach(evt => {
    window.removeEventListener(evt, onPageInteraction, { capture: true });
    document.removeEventListener(evt, onPageInteraction, { capture: true });
  });
}

// Pasang penjaga & langsung coba autoplay sejak awal
addAutoplayGuards();
playBgm();
window.addEventListener('load', playBgm);
document.addEventListener('DOMContentLoaded', playBgm);

/* ============================================================
   ANIMASI LOADING / SPLASH SCREEN CERIA (KHUSUS TK)
   ============================================================ */
(function setupLoader() {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  const runner = document.getElementById('loaderRunner');
  const msg = document.getElementById('loaderMsg');
  const skipBtn = document.getElementById('loaderSkip');

  if (!loader || !bar || !runner || !msg) return;

  // Coba putar musik saat animasi loading dimulai
  playBgm();

  const steps = [
    { pct: 25, text: 'Bismillah, menyapa pagi... ☀️' },
    { pct: 55, text: 'Merapikan buku & krayon... 🎨' },
    { pct: 85, text: 'Menyiapkan kelas ceria... 🎒' },
    { pct: 100, text: 'Hore! Pintu kelas sudah siap! 🎉' }
  ];

  let currentStep = 0;
  let isClosed = false;
  let autoTimer = null;

  function closeLoader() {
    if (isClosed) return;
    isClosed = true;
    clearTimeout(autoTimer);

    // Coba putar lagu saat loader ditutup
    playBgm();

    // Letupan bintang perayaan
    if (typeof burst === 'function') {
      burst(window.innerWidth / 2, window.innerHeight / 2, 12);
    }

    loader.classList.add('fade-out');
    document.body.classList.remove('loading-active');
    setTimeout(() => {
      loader.remove();
    }, 650);
  }

  function advance() {
    if (isClosed) return;
    if (currentStep < steps.length) {
      const { pct, text } = steps[currentStep];
      bar.style.width = pct + '%';
      runner.style.left = pct + '%';
      msg.textContent = text;
      currentStep++;

      if (pct === 100) {
        // Langsung terbuka otomatis tanpa harus tekan tombol pintu
        autoTimer = setTimeout(closeLoader, 500);
      } else {
        setTimeout(advance, 320 + Math.random() * 80);
      }
    }
  }

  document.body.classList.add('loading-active');
  setTimeout(advance, 200);

  if (skipBtn) skipBtn.addEventListener('click', closeLoader);
  loader.addEventListener('click', onPageInteraction, { passive: true });
  loader.addEventListener('touchstart', onPageInteraction, { passive: true });
  loader.addEventListener('touchmove', onPageInteraction, { passive: true });
  loader.addEventListener('touchend', onPageInteraction, { passive: true });
})();


