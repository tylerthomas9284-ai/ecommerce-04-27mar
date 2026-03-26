'use strict';

/* ── CONFIG ─────────────────────────────────────────────── */
const CART_KEY = 'croft_cart';

const PRODUCTS = [
  { id:'croft-face-wash',   name:'Charcoal Deep Cleanse Face Wash', price:24, category:'Cleansers',    image:'1683140854501-84fa2f8368d3', slug:'product-face-wash'   },
  { id:'croft-beard-oil',   name:'Hydrating Beard Oil',             price:28, category:'Beard Care',   image:'1757016632190-51445a99c98e', slug:'product-beard-oil'   },
  { id:'croft-moisturizer', name:'Daily Moisturizer SPF 30',        price:34, category:'Moisturizers', image:'1574441172403-7721268cd3d5', slug:'product-moisturizer' },
  { id:'croft-preshave',    name:'Pre-Shave Oil',                   price:26, category:'Shaving',      image:'1671777786930-5e0e2b574116', slug:'product-preshave'    },
  { id:'croft-hair-clay',   name:'Matte Texture Hair Clay',         price:30, category:'Hair',         image:'1773268959152-8cd1e5f2bc74', slug:'product-hair-clay'   },
  { id:'croft-aftershave',  name:'Cooling After-Shave Balm',        price:28, category:'Shaving',      image:'1608571899793-a1c0c27a7555', slug:'product-aftershave'  },
  { id:'croft-face-scrub',  name:'Volcanic Ash Face Scrub',         price:22, category:'Cleansers',    image:'1533808232502-bee53575c3af', slug:'product-face-scrub'  },
  { id:'croft-night-serum', name:'Overnight Recovery Serum',        price:42, category:'Serums',       image:'1671777784658-9d1b66c34a07', slug:'product-night-serum' },
  { id:'croft-starter-kit', name:'Complete Starter Kit',            price:89, category:'Kits',         image:'1613223026022-afda5c1c95b8', slug:'product-starter-kit' },
  { id:'croft-shaving-set', name:'Luxury Shaving Set',              price:65, category:'Shaving',      image:'1720362756223-2d6c7ebb4549', slug:'product-shaving-set' },
];

const IMG = id => `https://images.unsplash.com/photo-${id}?w=600&q=80&fit=crop`;

/* ── CART ────────────────────────────────────────────────── */
function getCart()  { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); }

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, name: p.name, price: p.price, qty, image: p.image });
  saveCart(cart);
  updateCartBadge();
  showToast(`${p.name} added to cart`);
}

function removeFromCart(id) { saveCart(getCart().filter(x => x.id !== id)); updateCartBadge(); }

function updateCartQty(id, qty) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) { item.qty = qty; if (item.qty <= 0) return removeFromCart(id); }
  saveCart(cart); updateCartBadge();
}

function clearCart()     { localStorage.removeItem(CART_KEY); updateCartBadge(); }
function getCartCount()  { return getCart().reduce((s, i) => s + i.qty, 0); }
function getCartTotal()  { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }

/* ── UI HELPERS ──────────────────────────────────────────── */
function updateCartBadge() {
  const n = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--show'));
  setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 400); }, 3000);
}

function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

/* ── NAV ─────────────────────────────────────────────────── */
function initNav() {
  const menuBtn = document.querySelector('.nav__menu-btn');
  const mobile  = document.querySelector('.nav__mobile');
  if (menuBtn && mobile) {
    menuBtn.addEventListener('click', () => {
      mobile.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', mobile.classList.contains('open'));
    });
  }
  // Active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ── COOKIE BANNER ───────────────────────────────────────── */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('croft_cookie')) { banner.remove(); return; }
  banner.style.display = 'flex';
  document.getElementById('cookie-accept')?.addEventListener('click', () => { localStorage.setItem('croft_cookie','1'); banner.remove(); });
  document.getElementById('cookie-decline')?.addEventListener('click', () => { localStorage.setItem('croft_cookie','0'); banner.remove(); });
}

/* ── FILTER TABS ─────────────────────────────────────────── */
function initFilterTabs() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card[data-category]');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      cards.forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
      });
      const visible = [...cards].filter(c => c.style.display !== 'none').length;
      const counter = document.querySelector('.products-count');
      if (counter) counter.textContent = `${visible} products`;
    });
  });
}

/* ── GRID ADD-TO-CART ────────────────────────────────────── */
function initGridAddToCart() {
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); addToCart(btn.dataset.addToCart); });
  });
}

/* ── PRODUCT PAGE ────────────────────────────────────────── */
function initQtySelector() {
  const minus = document.querySelector('.qty-btn--minus');
  const plus  = document.querySelector('.qty-btn--plus');
  const input = document.querySelector('.qty-input');
  if (!minus || !plus || !input) return;
  minus.addEventListener('click', () => { if (+input.value > 1) input.value = +input.value - 1; });
  plus.addEventListener('click',  () => { input.value = +input.value + 1; });
}

function initThumbnails() {
  const mainImg = document.querySelector('.product-detail__main-img');
  const thumbs  = document.querySelectorAll('.product-thumb img');
  if (!mainImg || !thumbs.length) return;
  thumbs.forEach(thumb => {
    thumb.parentElement.addEventListener('click', () => {
      thumbs.forEach(t => t.parentElement.classList.remove('active'));
      thumb.parentElement.classList.add('active');
      mainImg.src = thumb.src;
      mainImg.alt = thumb.alt;
    });
  });
}

function initAddToCartBtn() {
  const btn = document.querySelector('.add-to-cart-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const id  = btn.dataset.productId;
    const qty = +(document.querySelector('.qty-input')?.value) || 1;
    addToCart(id, qty);
  });
}

function initTabs() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.tab-panel[data-tab="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });
}

/* ── CHECKOUT ────────────────────────────────────────────── */
function renderOrderSummary() {
  const container  = document.getElementById('order-items');
  const subtotalEl = document.getElementById('order-subtotal');
  const shippingEl = document.getElementById('order-shipping');
  const totalEl    = document.getElementById('order-total');
  if (!container) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px 0">Your cart is empty. <a href="index.html" style="color:var(--gold)">Shop now →</a></p>';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item__img">
        <img src="${IMG(item.image)}" alt="${item.name}" loading="lazy">
        <span class="checkout-item__qty">${item.qty}</span>
      </div>
      <div class="checkout-item__info">
        <p class="checkout-item__name">${item.name}</p>
      </div>
      <p class="checkout-item__price">$${(item.price * item.qty).toFixed(2)}</p>
    </div>`).join('');

  const sub      = getCartTotal();
  const shipping = sub >= 50 ? 0 : 7.99;
  if (subtotalEl) subtotalEl.textContent = `$${sub.toFixed(2)}`;
  if (shippingEl) { shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`; if (shipping === 0) shippingEl.classList.add('order-free'); }
  if (totalEl)    totalEl.textContent    = `$${(sub + shipping).toFixed(2)}`;
}

function validateCheckoutForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(f => {
    f.classList.remove('field-error');
    if (!f.value.trim()) { f.classList.add('field-error'); valid = false; }
  });
  const email = form.querySelector('[name="email"]');
  if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('field-error'); valid = false; }
  const cb = form.querySelector('[name="consent"]');
  if (cb && !cb.checked) { showToast('Please agree to the terms to continue.', 'error'); valid = false; }
  if (!valid) showToast('Please fill in all required fields.', 'error');
  return valid;
}

function initCheckoutForm() {
  const form  = document.getElementById('checkout-form');
  const modal = document.getElementById('order-modal');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateCheckoutForm(form)) return;
    const name  = form.querySelector('[name="full-name"]').value.trim().split(' ')[0];
    const city  = form.querySelector('[name="city"]').value.trim();
    const state = form.querySelector('[name="state"]').value;
    const num   = 'CR-' + Math.floor(1000 + Math.random() * 9000);
    if (modal) {
      document.getElementById('modal-order-num').textContent  = num;
      document.getElementById('modal-name').textContent       = name;
      document.getElementById('modal-location').textContent   = `${city}, ${state}`;
      modal.classList.add('open');
    }
    clearCart();
  });

  document.getElementById('modal-close')?.addEventListener('click',    () => { modal.classList.remove('open'); window.location.href = 'index.html'; });
  document.getElementById('modal-continue')?.addEventListener('click', () => { modal.classList.remove('open'); window.location.href = 'index.html'; });
}

/* ── CONTACT FORM ────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast("Message sent! We'll get back to you within 24 hours.");
    form.reset();
  });
}

/* ── NEWSLETTER ──────────────────────────────────────────── */
function initNewsletter() {
  document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    showToast("You're in! Check your inbox for 10% off.");
    e.target.reset();
  });
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initNav();
  initFadeUp();
  initCookieBanner();
  initFilterTabs();
  initGridAddToCart();
  initQtySelector();
  initThumbnails();
  initAddToCartBtn();
  initTabs();
  renderOrderSummary();
  initCheckoutForm();
  initContactForm();
  initNewsletter();
});
