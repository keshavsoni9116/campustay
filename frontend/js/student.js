// ============================================================
//  CampuStay v3 — student.js
// ============================================================

let allProperties = [...DEMO_PROPERTIES];
let savedIds = JSON.parse(localStorage.getItem('cs_saved') || '[]');
let map = null, markers = [];
let currentModalProperty = null;

const SURVEY_STEPS = [
  { q: 'What\'s your sleep schedule?', hint: 'This helps match you with someone on the same rhythm', key: 'sleep', options: ['Early Bird (before 10pm)', 'Night Owl (after 12am)', 'Flexible'] },
  { q: 'Study habits preference?', hint: 'How do you prefer your environment when studying?', key: 'study', options: ['Complete Silence', 'Background Music OK', 'Study Groups Welcome'] },
  { q: 'How clean do you keep your space?', hint: 'Cleanliness compatibility reduces friction', key: 'clean', options: ['Spotlessly Clean', 'Generally Tidy', 'Organized Chaos', 'Relaxed'] },
  { q: 'Your diet preference?', hint: 'Food habits affect shared spaces', key: 'diet', options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'] },
  { q: 'Social lifestyle?', hint: 'How often do you have guests or go out?', key: 'social', options: ['Very Private', 'Balanced', 'Very Social'] },
  { q: 'Monthly budget range?', hint: 'Find someone in the same price range', key: 'budget', options: ['Under ₹8,000', '₹8,000–15,000', '₹15,000–25,000', '₹25,000+'] },
];

let surveyStep = 0;
let surveyAnswers = {};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('student')) return;
  populateNavUser();
  setGreeting();
  renderFeaturedProperties();
  renderHomeRoommates();
  renderSurveyStep();
  renderBookings();
  updateStats();
});

function setGreeting() {
  const user = getUser();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('welcome-msg').textContent = `${greet}, ${user?.name?.split(' ')[0] || 'Student'}! 👋`;
  document.getElementById('welcome-sub').textContent = 'Here\'s your housing overview for today';
}

function updateStats() {
  const bookings = isDemoMode() ? DEMO_BOOKINGS : [];
  document.getElementById('stat-bookings').textContent = bookings.length;
  document.getElementById('stat-saved').textContent = savedIds.length;
}

// ── Property card render ──
function renderPropertyCard(p, showSave = true) {
  const saved = savedIds.includes(p._id);
  const gClass = p.gender === 'Boys' ? 'boys' : p.gender === 'Girls' ? 'girls' : 'both';
  return `
    <div class="property-card" onclick="openModal('${p._id}')">
      <div class="property-thumb">
        ${p.emoji}
        <div class="property-thumb-badge verified">✓ Verified</div>
        ${showSave ? `<div class="property-save-btn ${saved ? 'saved' : ''}" onclick="event.stopPropagation();toggleSave('${p._id}',this)">
          ${saved ? '❤️' : '🤍'}
        </div>` : ''}
      </div>
      <div class="property-body">
        <div class="property-name">${p.name}</div>
        <div class="property-loc">📍 ${p.address}, ${p.city}</div>
        <div class="property-price">${formatINR(p.price)} <span>/month</span></div>
        <div class="property-tags">
          <span class="tag">${p.type}</span>
          <span class="tag ${gClass}">${p.gender}</span>
          ${p.amenities.slice(0, 2).map(a => `<span class="tag">${a}</span>`).join('')}
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center" onclick="event.stopPropagation();openModal('${p._id}')">View Details</button>
      </div>
    </div>`;
}

function renderFeaturedProperties() {
  const el = document.getElementById('featured-properties');
  if (!el) return;
  el.innerHTML = allProperties.slice(0, 3).map(p => renderPropertyCard(p)).join('');
}

function renderAllProperties(props = allProperties) {
  const el = document.getElementById('all-properties');
  const cnt = document.getElementById('prop-count');
  if (!el) return;
  if (props.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>No properties found</h3><p>Try adjusting your filters</p></div>`;
  } else {
    el.innerHTML = props.map(p => renderPropertyCard(p)).join('');
  }
  if (cnt) cnt.textContent = `${props.length} propert${props.length !== 1 ? 'ies' : 'y'} found`;
}

function filterProperties() {
  const loc = document.getElementById('search-loc')?.value?.toLowerCase() || '';
  const type = document.getElementById('search-type')?.value || '';
  const gender = document.getElementById('search-gender')?.value || '';
  const maxPrice = parseInt(document.getElementById('search-price')?.value) || Infinity;

  let filtered = allProperties.filter(p => {
    if (loc && !p.city.toLowerCase().includes(loc) && !p.address.toLowerCase().includes(loc)) return false;
    if (type && p.type !== type) return false;
    if (gender && p.gender !== gender && p.gender !== 'Both') return false;
    if (p.price > maxPrice) return false;
    return true;
  });
  renderAllProperties(filtered);
  updateMapMarkers(filtered);
}

function toggleSave(id, btn) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter(i => i !== id);
    btn.textContent = '🤍';
    btn.classList.remove('saved');
    showToast('Removed from saved', '');
  } else {
    savedIds.push(id);
    btn.textContent = '❤️';
    btn.classList.add('saved');
    showToast('Saved to favorites ❤️', 'success');
  }
  localStorage.setItem('cs_saved', JSON.stringify(savedIds));
  document.getElementById('stat-saved').textContent = savedIds.length;
}

// ── Map ──
function initMap() {
  if (map) return;
  map = L.map('property-map', { zoomControl: true }).setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18,
  }).addTo(map);
  updateMapMarkers(allProperties);
}

function updateMapMarkers(props) {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  props.forEach(p => {
    if (!p.lat || !p.lng) return;
    const icon = L.divIcon({
      html: `<div style="background:var(--accent);color:#0c0c10;padding:4px 8px;border-radius:8px;font-size:0.72rem;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4)">₹${(p.price/1000).toFixed(0)}K</div>`,
      className: '',
      iconAnchor: [20, 15],
    });
    const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
    m.bindPopup(`<strong style="font-family:sans-serif">${p.name}</strong><br><span style="font-size:0.8rem;color:#999">${p.address}, ${p.city}</span><br><strong style="color:var(--accent)">₹${p.price.toLocaleString('en-IN')}/mo</strong>`);
    m.on('click', () => openModal(p._id));
    markers.push(m);
  });
}

// ── Modal ──
function openModal(id) {
  const p = allProperties.find(x => x._id === id);
  if (!p) return;
  currentModalProperty = p;
  document.getElementById('m-name').textContent = p.name;
  document.getElementById('m-loc').textContent = `📍 ${p.address}, ${p.city}`;
  document.getElementById('m-emoji').textContent = p.emoji;
  document.getElementById('m-price').textContent = formatINR(p.price) + '/mo';
  document.getElementById('m-type').textContent = p.type;
  document.getElementById('m-gender').textContent = p.gender;
  document.getElementById('m-rooms').textContent = p.roomsAvailable + ' rooms';
  document.getElementById('m-amenities').innerHTML = p.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join('');
  document.getElementById('m-desc').textContent = p.description;
  document.getElementById('propertyModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('propertyModal').classList.add('hidden');
  currentModalProperty = null;
}

document.getElementById('propertyModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function bookCurrentProperty() {
  if (!currentModalProperty) return;
  const p = currentModalProperty;

  // Demo mode
  if (isDemoMode()) {
    const existing = DEMO_BOOKINGS.find(b => b.propertyId === p._id);
    if (existing) { showToast('Already requested booking for this property!', ''); return; }
    DEMO_BOOKINGS.push({ _id: 'b' + Date.now(), propertyId: p._id, status: 'pending', createdAt: new Date().toISOString(), property: p });
    showToast('Booking request sent! ✅', 'success');
    closeModal();
    renderBookings();
    updateStats();
    return;
  }

  try {
    await apiFetch('/bookings', { method: 'POST', body: JSON.stringify({ propertyId: p._id }) });
    showToast('Booking request sent! ✅', 'success');
    closeModal();
    renderBookings();
  } catch (e) {
    showToast(e.message || 'Failed to book', 'error');
  }
}

// ── Bookings ──
async function renderBookings() {
  const el = document.getElementById('booking-list');
  if (!el) return;

  let bookings;
  if (isDemoMode()) {
    bookings = DEMO_BOOKINGS;
  } else {
    try {
      bookings = await apiFetch('/bookings/mine');
    } catch {
      bookings = [];
    }
  }

  if (!bookings.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No bookings yet</h3><p>Browse properties and request a booking to get started</p><button class="btn btn-primary" style="margin-top:1rem" onclick="switchTab('browse')">Browse Properties</button></div>`;
    return;
  }

  el.innerHTML = bookings.map(b => {
    const p = b.property || allProperties.find(x => x._id === b.propertyId) || {};
    const statusMap = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-cancelled' };
    return `
      <div class="booking-card">
        <div class="booking-thumb">${p.emoji || '🏠'}</div>
        <div class="booking-info">
          <div class="booking-name">${p.name || 'Property'}</div>
          <div class="booking-meta">📍 ${p.address || ''}, ${p.city || ''} &nbsp;•&nbsp; ${p.type || ''}</div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="badge ${statusMap[b.status] || 'badge-pending'}">${b.status}</span>
            <span style="font-size:0.78rem;color:var(--text3)">${formatDate(b.createdAt)}</span>
          </div>
        </div>
        <div class="booking-actions">
          <div style="text-align:right">
            <div style="font-family:'Clash Display',sans-serif;font-size:1.1rem;font-weight:700;color:var(--accent)">${formatINR(p.price || 0)}</div>
            <div style="font-size:0.75rem;color:var(--text3)">/month</div>
          </div>
          ${b.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking request?')) return;
  if (isDemoMode()) {
    const idx = DEMO_BOOKINGS.findIndex(b => b._id === id);
    if (idx !== -1) DEMO_BOOKINGS.splice(idx, 1);
    showToast('Booking cancelled', '');
    renderBookings();
    updateStats();
    return;
  }
  try {
    await apiFetch('/bookings/' + id, { method: 'DELETE' });
    showToast('Booking cancelled');
    renderBookings();
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Survey ──
function renderSurveyStep() {
  const step = SURVEY_STEPS[surveyStep];
  const bar = document.getElementById('survey-bar');
  const label = document.getElementById('survey-step-label');
  const card = document.getElementById('survey-card');
  if (!step || !card) return;

  if (bar) bar.style.width = ((surveyStep / SURVEY_STEPS.length) * 100) + '%';
  if (label) label.textContent = `Step ${surveyStep + 1} of ${SURVEY_STEPS.length}`;

  card.innerHTML = `
    <div class="survey-q">${step.q}</div>
    <div class="survey-hint">${step.hint}</div>
    <div class="option-chips" id="chips-${step.key}">
      ${step.options.map(o => `<div class="chip ${surveyAnswers[step.key] === o ? 'selected' : ''}" onclick="selectChip(this);surveyAnswers['${step.key}']='${o}'">${o}</div>`).join('')}
    </div>
    <div class="survey-nav">
      ${surveyStep > 0 ? `<button class="btn btn-ghost" onclick="surveyBack()">← Back</button>` : '<div></div>'}
      <button class="btn btn-primary" onclick="surveyNext()">${surveyStep === SURVEY_STEPS.length - 1 ? '🎯 Find Matches' : 'Next →'}</button>
    </div>`;
}

function surveyNext() {
  const step = SURVEY_STEPS[surveyStep];
  if (!surveyAnswers[step.key]) { showToast('Please select an option', ''); return; }
  if (surveyStep < SURVEY_STEPS.length - 1) {
    surveyStep++;
    renderSurveyStep();
  } else {
    showMatches();
  }
}

function surveyBack() {
  if (surveyStep > 0) { surveyStep--; renderSurveyStep(); }
}

function restartSurvey() {
  surveyStep = 0;
  surveyAnswers = {};
  document.getElementById('survey-section').style.display = '';
  document.getElementById('matches-section').style.display = 'none';
  renderSurveyStep();
}

function showMatches() {
  document.getElementById('survey-section').style.display = 'none';
  document.getElementById('matches-section').style.display = '';
  const el = document.getElementById('roommate-results');
  el.innerHTML = DEMO_ROOMMATES.map(r => renderRoommateCard(r)).join('');
  document.getElementById('survey-bar').style.width = '100%';
}

function renderRoommateCard(r) {
  return `
    <div class="roommate-card">
      <div class="roommate-avatar" style="background:${r.avatarGrad}">${r.avatar}</div>
      <div class="roommate-name">${r.name}</div>
      <div class="roommate-college">${r.college}</div>
      <div class="match-score-badge">⚡ ${r.score}% Match</div>
      <div class="roommate-traits">
        <span class="trait-chip">${r.sleep}</span>
        <span class="trait-chip">${r.diet}</span>
        <span class="trait-chip">${r.social}</span>
        <span class="trait-chip">${r.budget}</span>
      </div>
      <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center" onclick="showToast('Message sent to ${r.name}! 📩','success')">📩 Connect</button>
    </div>`;
}

function renderHomeRoommates() {
  const el = document.getElementById('home-roommates');
  if (!el) return;
  el.innerHTML = DEMO_ROOMMATES.slice(0, 3).map(r => renderRoommateCard(r)).join('');
}

// ── Override switchTab to init map ──
const _origSwitch = window.switchTab;
window.switchTab = function(id) {
  // Update sidebar
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
  const panel = document.getElementById('tab-' + id);
  if (panel) { panel.style.display = ''; }

  document.querySelectorAll('[id^="snav-"]').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById('snav-' + id);
  if (navLink) navLink.classList.add('active');

  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.toggle('active', s.dataset.tab === id));
  document.querySelectorAll('.mobile-tab-btn').forEach((b, i) => {
    const tabs = ['home', 'browse', 'roommate', 'bookings'];
    b.classList.toggle('active', tabs[i] === id);
  });

  if (id === 'browse') {
    renderAllProperties();
    setTimeout(initMap, 100);
  }
  if (id === 'bookings') renderBookings();
};
