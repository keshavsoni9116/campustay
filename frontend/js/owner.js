// ============================================================
//  CampuStay v3 — owner.js
// ============================================================

let ownerProperties = [];
let ownerRequests = [];
let editingPropertyId = null;

// Demo owner data
const OWNER_PROPERTIES = [
  { _id: 'op1', name: 'Sunrise Boys Hostel', city: 'Pune', address: 'Koregaon Park', price: 8500, type: 'Hostel', gender: 'Boys', emoji: '🏢', amenities: ['WiFi', 'Meals', 'Laundry'], roomsAvailable: 4, isApproved: true, description: 'Spacious hostel near Pune University.' },
  { _id: 'op2', name: 'Scholar\'s Den', city: 'Delhi', address: 'Lajpat Nagar', price: 7500, type: 'Hostel', gender: 'Boys', emoji: '🏗️', amenities: ['WiFi', 'Study Room', 'Meals'], roomsAvailable: 8, isApproved: false, description: 'Budget hostel with study rooms.' },
];

const OWNER_REQUESTS = [
  { _id: 'req1', propertyId: 'op1', studentName: 'Ananya Sharma', studentEmail: 'ananya@student.com', college: 'Delhi University', status: 'pending', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), property: OWNER_PROPERTIES[0] },
  { _id: 'req2', propertyId: 'op1', studentName: 'Rahul Verma', studentEmail: 'rahul@student.com', college: 'IIT Bombay', status: 'approved', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), property: OWNER_PROPERTIES[0] },
  { _id: 'req3', propertyId: 'op2', studentName: 'Karan Singh', studentEmail: 'karan@student.com', college: 'NIT Trichy', status: 'pending', createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), property: OWNER_PROPERTIES[1] },
];

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('owner')) return;
  populateNavUser();
  ownerProperties = [...OWNER_PROPERTIES];
  ownerRequests = [...OWNER_REQUESTS];
  renderOwnerProperties();
  updateOwnerStats();
});

function updateOwnerStats() {
  document.getElementById('stat-total').textContent = ownerProperties.length;
  document.getElementById('stat-approved').textContent = ownerProperties.filter(p => p.isApproved).length;
  document.getElementById('stat-pending-props').textContent = ownerProperties.filter(p => !p.isApproved).length;
  document.getElementById('stat-requests').textContent = ownerRequests.filter(r => r.status === 'pending').length;
}

function renderOwnerProperties() {
  const el = document.getElementById('owner-properties');
  if (!el) return;
  if (!ownerProperties.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏘️</div><h3>No properties yet</h3><p>Add your first property to start receiving booking requests</p><button class="btn btn-primary" style="margin-top:1rem" onclick="switchTab('add')">Add Property</button></div>`;
    return;
  }
  el.innerHTML = ownerProperties.map(p => `
    <div class="booking-card" style="margin-bottom:1rem;align-items:flex-start">
      <div class="booking-thumb">${p.emoji}</div>
      <div class="booking-info">
        <div class="booking-name">${p.name}</div>
        <div class="booking-meta">📍 ${p.address}, ${p.city} &nbsp;•&nbsp; ${p.type} &nbsp;•&nbsp; For ${p.gender}</div>
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-top:6px">
          <span class="badge ${p.isApproved ? 'badge-approved' : 'badge-pending'}">${p.isApproved ? 'Approved' : 'Pending Review'}</span>
          <span style="font-size:0.78rem;color:var(--text3)">${p.roomsAvailable} rooms available</span>
          <div class="amenity-chips">${p.amenities.slice(0, 3).map(a => `<span class="amenity-chip">${a}</span>`).join('')}</div>
        </div>
      </div>
      <div class="booking-actions" style="flex-direction:column;gap:0.5rem;align-items:flex-end">
        <div style="font-family:'Clash Display',sans-serif;font-size:1.2rem;font-weight:700;color:var(--accent)">${formatINR(p.price)}<span style="font-size:0.75rem;color:var(--text3);font-family:'Satoshi',sans-serif">/mo</span></div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-outline btn-sm" onclick="editProperty('${p._id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('${p._id}')">🗑️</button>
        </div>
      </div>
    </div>`).join('');
}

function renderRequests() {
  const el = document.getElementById('request-list');
  if (!el) return;
  if (!ownerRequests.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No booking requests yet</h3><p>Requests will appear here once students find your listings</p></div>`;
    return;
  }
  el.innerHTML = ownerRequests.map(r => `
    <div class="booking-card" style="margin-bottom:1rem">
      <div class="booking-thumb" style="background:linear-gradient(135deg,var(--accent),var(--accent2));color:#0c0c10;font-weight:700;font-size:1.2rem">${r.studentName[0]}</div>
      <div class="booking-info">
        <div class="booking-name">${r.studentName}</div>
        <div class="booking-meta">🎓 ${r.college} &nbsp;•&nbsp; 📧 ${r.studentEmail}</div>
        <div class="booking-meta" style="margin-top:4px">🏠 ${r.property?.name || 'Property'} &nbsp;•&nbsp; ${formatDate(r.createdAt)}</div>
        <span class="badge ${r.status === 'pending' ? 'badge-pending' : r.status === 'approved' ? 'badge-approved' : 'badge-rejected'}" style="margin-top:6px;display:inline-flex">${r.status}</span>
      </div>
      ${r.status === 'pending' ? `
      <div class="booking-actions">
        <button class="btn btn-success btn-sm" onclick="respondRequest('${r._id}','approved')">✅ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="respondRequest('${r._id}','rejected')">✕ Decline</button>
      </div>` : '<div></div>'}
    </div>`).join('');
}

function respondRequest(id, status) {
  const req = ownerRequests.find(r => r._id === id);
  if (!req) return;
  req.status = status;
  showToast(status === 'approved' ? '✅ Booking approved!' : '❌ Booking declined', status === 'approved' ? 'success' : '');
  renderRequests();
  updateOwnerStats();
  // Real API: apiFetch('/bookings/' + id + '/respond', { method: 'PUT', body: JSON.stringify({ status }) })
}

function editProperty(id) {
  const p = ownerProperties.find(x => x._id === id);
  if (!p) return;
  editingPropertyId = id;
  switchTab('add');
  document.getElementById('add-form-title').textContent = 'Edit Property';
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-city').value = p.city;
  document.getElementById('p-address').value = p.address;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-rooms').value = p.roomsAvailable;
  document.getElementById('p-type').value = p.type;
  document.getElementById('p-gender').value = p.gender;
  document.getElementById('p-desc').value = p.description;
  document.querySelectorAll('.amenity-cb input').forEach(cb => {
    cb.checked = p.amenities.includes(cb.value);
  });
  document.getElementById('submit-prop-btn').textContent = 'Update Property';
}

function resetPropertyForm() {
  editingPropertyId = null;
  document.getElementById('add-form-title').textContent = 'Add New Property';
  document.getElementById('submit-prop-btn').textContent = 'Submit for Review';
  ['p-name','p-city','p-address','p-price','p-rooms','p-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-type').value = '';
  document.getElementById('p-gender').value = '';
  document.querySelectorAll('.amenity-cb input').forEach(cb => cb.checked = false);
}

async function submitProperty() {
  const name = document.getElementById('p-name').value.trim();
  const city = document.getElementById('p-city').value.trim();
  const address = document.getElementById('p-address').value.trim();
  const price = parseInt(document.getElementById('p-price').value);
  const rooms = parseInt(document.getElementById('p-rooms').value) || 1;
  const type = document.getElementById('p-type').value;
  const gender = document.getElementById('p-gender').value;
  const description = document.getElementById('p-desc').value.trim();
  const amenities = [...document.querySelectorAll('.amenity-cb input:checked')].map(c => c.value);

  if (!name || !city || !price || !type || !gender) { showToast('Please fill all required fields', 'error'); return; }

  const emojis = { Hostel: '🏢', PG: '🏠' };
  const propData = { name, city, address, price, roomsAvailable: rooms, type, gender, description, amenities, emoji: emojis[type] || '🏠', isApproved: false };

  if (isDemoMode()) {
    if (editingPropertyId) {
      const idx = ownerProperties.findIndex(p => p._id === editingPropertyId);
      if (idx !== -1) ownerProperties[idx] = { ...ownerProperties[idx], ...propData };
      showToast('Property updated! ✅', 'success');
    } else {
      ownerProperties.push({ _id: 'op' + Date.now(), ...propData });
      showToast('Property submitted for review! 📋', 'success');
    }
    resetPropertyForm();
    switchTab('properties');
    renderOwnerProperties();
    updateOwnerStats();
    return;
  }

  try {
    const btn = document.getElementById('submit-prop-btn');
    btn.innerHTML = '<div class="spinner"></div> Submitting...';
    btn.disabled = true;
    if (editingPropertyId) {
      await apiFetch('/properties/' + editingPropertyId, { method: 'PUT', body: JSON.stringify(propData) });
    } else {
      await apiFetch('/properties', { method: 'POST', body: JSON.stringify(propData) });
    }
    showToast(editingPropertyId ? 'Property updated!' : 'Submitted for review!', 'success');
    resetPropertyForm();
    switchTab('properties');
  } catch (e) {
    showToast(e.message, 'error');
    document.getElementById('submit-prop-btn').innerHTML = editingPropertyId ? 'Update Property' : 'Submit for Review';
    document.getElementById('submit-prop-btn').disabled = false;
  }
}

function confirmDelete(id) {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('hidden');
  document.getElementById('confirmDeleteBtn').onclick = () => {
    deleteProperty(id);
    modal.classList.add('hidden');
  };
}

async function deleteProperty(id) {
  if (isDemoMode()) {
    const idx = ownerProperties.findIndex(p => p._id === id);
    if (idx !== -1) ownerProperties.splice(idx, 1);
    showToast('Property deleted', '');
    renderOwnerProperties();
    updateOwnerStats();
    return;
  }
  try {
    await apiFetch('/properties/' + id, { method: 'DELETE' });
    showToast('Property deleted');
    renderOwnerProperties();
  } catch (e) { showToast(e.message, 'error'); }
}

// Override switchTab for owner
window.switchTab = function(id) {
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.style.display = '';

  document.querySelectorAll('[id^="snav-"]').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById('snav-' + id);
  if (navLink) navLink.classList.add('active');

  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.toggle('active', s.dataset.tab === id));

  if (id === 'requests') renderRequests();
};
