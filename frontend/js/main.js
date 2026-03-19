// ============================================================
//  CampuStay v3 — main.js
//  Shared utilities: auth, API, toast, animations
// ============================================================

const API_BASE = 'http://localhost:5000/api';

/* ── Toast ── */
let _toastTimer;
function showToast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── Dropdown ── */
function toggleDropdown(id) {
  document.querySelectorAll('.dropdown-menu').forEach(d => { if (d.id !== id) d.classList.remove('open'); });
  document.getElementById(id)?.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.avatar')) document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('open'));
});

/* ── Chip selector ── */
function selectChip(el) {
  el.closest('.option-chips')?.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── Auth helpers ── */
function getToken()   { return localStorage.getItem('cs_token'); }
function getUser()    { return JSON.parse(localStorage.getItem('cs_user') || 'null'); }
function isLoggedIn() { return !!getToken(); }
function isDemoMode() { return getToken()?.startsWith('demo_token_'); }
function logout() {
  localStorage.removeItem('cs_token');
  localStorage.removeItem('cs_user');
  window.location.href = '../index.html';
}

/* ── API fetch ── */
async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) };
  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

/* ── Auth guard ── */
function requireAuth(role) {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = 'login.html'; return false; }
  if (role && user.role !== role) { showToast('Access denied.', 'error'); window.location.href = '../index.html'; return false; }
  return true;
}

/* ── Helpers ── */
function initials(name = '') { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function formatINR(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return Math.floor(hrs / 24) + 'd ago';
}

/* ── Cursor glow ── */
const glowEl = document.getElementById('cursorGlow');
if (glowEl) {
  document.addEventListener('mousemove', e => {
    glowEl.style.left = e.clientX + 'px';
    glowEl.style.top = e.clientY + 'px';
  });
}

/* ── Scroll reveal ── */
document.addEventListener('DOMContentLoaded', () => {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
});

/* ── Nav tab switcher ── */
function switchTab(id) {
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
  const panel = document.getElementById('tab-' + id);
  if (panel) { panel.style.display = ''; panel.style.animation = 'fadeInUp 0.3s ease'; }
  document.querySelectorAll('[id^="snav-"]').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById('snav-' + id);
  if (navLink) navLink.classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.toggle('active', s.dataset.tab === id));
}

/* ── Populate user avatar ── */
function populateNavUser() {
  const user = getUser();
  if (!user) return;
  const av = document.getElementById('user-avatar');
  if (av) av.textContent = initials(user.name);
  const nameEl = document.getElementById('user-name-display');
  if (nameEl) nameEl.textContent = user.name;
}

/* ── Demo data ── */
const DEMO_PROPERTIES = [
  { _id:'p1', name:'Sunrise Boys Hostel', city:'Pune', address:'Koregaon Park', price:8500, type:'Hostel', gender:'Boys', emoji:'🏢', amenities:['WiFi','Meals','Laundry','Hot Water'], roomsAvailable:4, lat:18.5362, lng:73.8938, description:'Spacious hostel near Pune University with excellent facilities. 24/7 security, home-cooked meals.', isApproved:true },
  { _id:'p2', name:'Girls Paradise PG', city:'Mumbai', address:'Andheri West', price:12000, type:'PG', gender:'Girls', emoji:'🏠', amenities:['WiFi','AC','Security','Meals'], roomsAvailable:2, lat:19.1360, lng:72.8296, description:'Premium girls PG in the heart of Andheri. Fully furnished rooms, 24x7 CCTV security.', isApproved:true },
  { _id:'p3', name:'Campus View Residency', city:'Bangalore', address:'HSR Layout', price:9500, type:'PG', gender:'Both', emoji:'🏘️', amenities:['WiFi','Meals','Gym','Power Backup'], roomsAvailable:6, lat:12.9116, lng:77.6381, description:'Modern co-living space designed for working professionals and students. Gym, cafeteria on premises.', isApproved:true },
  { _id:'p4', name:'Scholar\'s Den', city:'Delhi', address:'Lajpat Nagar', price:7500, type:'Hostel', gender:'Boys', emoji:'🏗️', amenities:['WiFi','Study Room','Meals'], roomsAvailable:8, lat:28.5672, lng:77.2432, description:'Budget-friendly hostel with dedicated study rooms. Perfect for UPSC and engineering aspirants.', isApproved:true },
  { _id:'p5', name:'Lakshmi Villa PG', city:'Hyderabad', address:'Banjara Hills', price:11000, type:'PG', gender:'Girls', emoji:'🏡', amenities:['WiFi','AC','Meals','Washing Machine'], roomsAvailable:3, lat:17.4126, lng:78.4483, description:'Luxurious girls PG in Banjara Hills with all modern amenities. Attached bathrooms available.', isApproved:true },
  { _id:'p6', name:'Tech Hub Residency', city:'Bangalore', address:'Whitefield', price:14000, type:'PG', gender:'Both', emoji:'🏙️', amenities:['WiFi','AC','Gym','Pool'], roomsAvailable:5, lat:12.9698, lng:77.7499, description:'Premium PG near IT parks. High-speed internet, swimming pool, fully equipped gym.', isApproved:true },
];

const DEMO_BOOKINGS = [
  { _id:'b1', propertyId:'p1', userId:'s1', status:'approved', createdAt: new Date(Date.now()-5*86400000).toISOString(), property: DEMO_PROPERTIES[0] },
  { _id:'b2', propertyId:'p3', userId:'s1', status:'pending', createdAt: new Date(Date.now()-2*86400000).toISOString(), property: DEMO_PROPERTIES[2] },
];

const DEMO_ROOMMATES = [
  { _id:'r1', name:'Rahul Verma', college:'IIT Bombay', score:94, sleep:'Night Owl', diet:'Non-Veg', study:'Background Music OK', social:'Balanced', budget:'₹8–15K', avatar:'R', avatarGrad:'linear-gradient(135deg,#2dd4bf,#0f7a5e)' },
  { _id:'r2', name:'Arjun Patel', college:'BITS Pilani', score:87, sleep:'Night Owl', diet:'Vegetarian', study:'Complete Silence', social:'Very Private', budget:'₹8–15K', avatar:'A', avatarGrad:'linear-gradient(135deg,#818cf8,#4f46e5)' },
  { _id:'r3', name:'Karan Singh', college:'NIT Trichy', score:81, sleep:'Flexible', diet:'No Preference', study:'Background Music OK', social:'Balanced', budget:'₹15–25K', avatar:'K', avatarGrad:'linear-gradient(135deg,#fb7185,#e11d48)' },
  { _id:'r4', name:'Dev Sharma', college:'VIT Vellore', score:76, sleep:'Early Bird', diet:'Vegetarian', study:'Complete Silence', social:'Balanced', budget:'₹8–15K', avatar:'D', avatarGrad:'linear-gradient(135deg,#f59e0b,#fb923c)' },
];
