// ============================================================
//  CampuStay v3 — admin.js
// ============================================================

const ADMIN_USERS = [
  { _id:'u1', name:'Ananya Sharma', email:'ananya@student.com', role:'student', createdAt:'2024-01-10', bookings:2 },
  { _id:'u2', name:'Rohan Mehta', email:'rohan@student.com', role:'student', createdAt:'2024-01-15', bookings:1 },
  { _id:'u3', name:'Priya Nair', email:'priya@owner.com', role:'owner', createdAt:'2024-01-08', bookings:0 },
  { _id:'u4', name:'Vikram Das', email:'vikram@student.com', role:'student', createdAt:'2024-02-01', bookings:3 },
  { _id:'u5', name:'Sneha Reddy', email:'sneha@owner.com', role:'owner', createdAt:'2024-02-05', bookings:0 },
  { _id:'u6', name:'Arjun Patel', email:'arjun@student.com', role:'student', createdAt:'2024-02-20', bookings:1 },
];

const ADMIN_PROPERTIES = [
  { _id:'p1', name:'Sunrise Boys Hostel', ownerName:'Priya Nair', city:'Pune', price:8500, type:'Hostel', gender:'Boys', emoji:'🏢', isApproved:true },
  { _id:'p2', name:'Girls Paradise PG', ownerName:'Sneha Reddy', city:'Mumbai', price:12000, type:'PG', gender:'Girls', emoji:'🏠', isApproved:true },
  { _id:'p3', name:'Campus View Residency', ownerName:'Priya Nair', city:'Bangalore', price:9500, type:'PG', gender:'Both', emoji:'🏘️', isApproved:true },
  { _id:'p4', name:'Scholar\'s Den', ownerName:'Priya Nair', city:'Delhi', price:7500, type:'Hostel', gender:'Boys', emoji:'🏗️', isApproved:false },
  { _id:'p5', name:'Lakshmi Villa PG', ownerName:'Sneha Reddy', city:'Hyderabad', price:11000, type:'PG', gender:'Girls', emoji:'🏡', isApproved:false },
  { _id:'p6', name:'Tech Hub Residency', ownerName:'Priya Nair', city:'Bangalore', price:14000, type:'PG', gender:'Both', emoji:'🏙️', isApproved:true },
];

const ADMIN_BOOKINGS = [
  { _id:'b1', studentName:'Ananya Sharma', propertyName:'Sunrise Boys Hostel', ownerName:'Priya Nair', date:'2024-03-01', amount:8500, status:'approved' },
  { _id:'b2', studentName:'Rohan Mehta', propertyName:'Campus View Residency', ownerName:'Priya Nair', date:'2024-03-05', amount:9500, status:'approved' },
  { _id:'b3', studentName:'Vikram Das', propertyName:'Girls Paradise PG', ownerName:'Sneha Reddy', date:'2024-03-08', amount:12000, status:'pending' },
  { _id:'b4', studentName:'Arjun Patel', propertyName:'Scholar\'s Den', ownerName:'Priya Nair', date:'2024-03-10', amount:7500, status:'pending' },
  { _id:'b5', studentName:'Rohan Mehta', propertyName:'Tech Hub Residency', ownerName:'Priya Nair', date:'2024-03-12', amount:14000, status:'rejected' },
];

let adminProps = [...ADMIN_PROPERTIES];
let currentFilter = 'all';
let chartsInit = false;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('admin')) return;
  populateNavUser();
  renderMetrics();
  renderActivityFeed();
  setTimeout(initCharts, 200);
});

function renderMetrics() {
  document.getElementById('m-users').textContent = ADMIN_USERS.length;
  document.getElementById('m-props').textContent = adminProps.length;
  document.getElementById('m-bookings').textContent = ADMIN_BOOKINGS.length;
  document.getElementById('m-pending').textContent = adminProps.filter(p => !p.isApproved).length;
  const pc = document.getElementById('pending-count');
  if (pc) pc.textContent = `(${adminProps.filter(p => !p.isApproved).length})`;
}

function initCharts() {
  if (chartsInit) return;
  chartsInit = true;

  const chartDefaults = {
    plugins: { legend: { labels: { color: '#9999b0', font: { family: 'Satoshi, sans-serif', size: 11 } } } },
    scales: { x: { ticks: { color: '#55556a' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#55556a' }, grid: { color: 'rgba(255,255,255,0.04)' } } }
  };

  // Bookings last 7 days
  const bCtx = document.getElementById('bookingsChart')?.getContext('2d');
  if (bCtx) {
    new Chart(bCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'Bookings', data: [4, 7, 5, 9, 12, 8, 6], backgroundColor: 'rgba(245,158,11,0.6)', borderColor: '#f59e0b', borderWidth: 2, borderRadius: 6 }]
      },
      options: { ...chartDefaults, responsive: true }
    });
  }

  // City distribution
  const cCtx = document.getElementById('cityChart')?.getContext('2d');
  if (cCtx) {
    new Chart(cCtx, {
      type: 'doughnut',
      data: {
        labels: ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad'],
        datasets: [{ data: [18, 14, 22, 10, 9], backgroundColor: ['#f59e0b', '#2dd4bf', '#818cf8', '#fb7185', '#4ade80'], borderWidth: 0, hoverOffset: 8 }]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#9999b0', font: { family: 'Satoshi, sans-serif', size: 11 } } } }, cutout: '65%' }
    });
  }

  // Type donut
  const tCtx = document.getElementById('typeChart')?.getContext('2d');
  if (tCtx) {
    new Chart(tCtx, {
      type: 'pie',
      data: {
        labels: ['PG', 'Hostel'],
        datasets: [{ data: [62, 38], backgroundColor: ['#f59e0b', '#2dd4bf'], borderWidth: 0, hoverOffset: 8 }]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: '#9999b0', font: { family: 'Satoshi, sans-serif', size: 12 } } } } }
    });
  }

  // Growth chart
  const gCtx = document.getElementById('growthChart')?.getContext('2d');
  if (gCtx) {
    new Chart(gCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'New Users', data: [120, 180, 240, 310, 420, 580, 720, 850, 920, 1050, 1180, 1340], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)', tension: 0.4, fill: true, pointBackgroundColor: '#f59e0b' },
          { label: 'New Properties', data: [30, 45, 60, 80, 110, 150, 190, 220, 250, 290, 330, 380], borderColor: '#2dd4bf', backgroundColor: 'rgba(45,212,191,0.05)', tension: 0.4, fill: true, pointBackgroundColor: '#2dd4bf' }
        ]
      },
      options: { ...chartDefaults, responsive: true }
    });
  }
}

function renderActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;
  const activities = [
    { icon:'🏠', text:'New property submitted', sub:'Scholar\'s Den — Priya Nair', time:'2m ago', color:'var(--accent)' },
    { icon:'🎓', text:'New student registered', sub:'Arjun Patel — VIT Vellore', time:'15m ago', color:'var(--teal)' },
    { icon:'📋', text:'Booking request placed', sub:'Ananya → Sunrise Boys Hostel', time:'1h ago', color:'var(--blue)' },
    { icon:'✅', text:'Property approved', sub:'Campus View Residency', time:'3h ago', color:'var(--green)' },
    { icon:'📋', text:'Booking approved', sub:'Rohan → Tech Hub Residency', time:'5h ago', color:'var(--green)' },
  ];
  el.innerHTML = activities.map(a => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:0.6rem 0;border-bottom:1px solid var(--border)">
      <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0">${a.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.82rem;font-weight:500;color:var(--text)">${a.text}</div>
        <div style="font-size:0.75rem;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.sub}</div>
      </div>
      <div style="font-size:0.72rem;color:var(--text3);flex-shrink:0">${a.time}</div>
    </div>`).join('');
}

function renderPropsTable(filter = 'all') {
  const tbody = document.getElementById('props-table-body');
  if (!tbody) return;
  const filtered = filter === 'all' ? adminProps : filter === 'pending' ? adminProps.filter(p => !p.isApproved) : adminProps.filter(p => p.isApproved);
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:1.2rem">${p.emoji}</span><div><div style="font-weight:600;color:var(--text);font-size:0.875rem">${p.name}</div><div style="font-size:0.75rem;color:var(--text3)">${p.type} • For ${p.gender}</div></div></div></td>
      <td>${p.ownerName}</td>
      <td>${p.city}</td>
      <td style="color:var(--accent);font-weight:600">${formatINR(p.price)}</td>
      <td><span class="tag">${p.type}</span></td>
      <td><span class="badge ${p.isApproved ? 'badge-approved' : 'badge-pending'}">${p.isApproved ? 'Approved' : 'Pending'}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          ${!p.isApproved ? `<button class="btn btn-success btn-sm" onclick="approveProperty('${p._id}')">✅ Approve</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="adminDeleteProp('${p._id}')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterPropsBy(type, btn) {
  currentFilter = type;
  document.querySelectorAll('[id^="filter-"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPropsTable(type);
}

function approveProperty(id) {
  const p = adminProps.find(x => x._id === id);
  if (!p) return;
  p.isApproved = true;
  showToast(`✅ ${p.name} approved!`, 'success');
  renderPropsTable(currentFilter);
  renderMetrics();
  // Real: apiFetch('/admin/properties/' + id + '/approve', { method: 'PUT' })
}

function adminDeleteProp(id) {
  if (!confirm('Delete this property?')) return;
  const idx = adminProps.findIndex(x => x._id === id);
  if (idx !== -1) adminProps.splice(idx, 1);
  showToast('Property removed', '');
  renderPropsTable(currentFilter);
  renderMetrics();
}

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_USERS.map(u => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;color:#0c0c10">${u.name[0]}</div><span style="font-weight:600;color:var(--text)">${u.name}</span></div></td>
      <td>${u.email}</td>
      <td><span class="badge ${u.role === 'owner' ? 'badge-active' : 'badge-pending'}">${u.role}</span></td>
      <td>${formatDate(u.createdAt)}</td>
      <td>${u.bookings}</td>
      <td><button class="btn btn-danger btn-sm" onclick="showToast('User suspended (demo)','')">Suspend</button></td>
    </tr>`).join('');
}

function renderBookingsTable() {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_BOOKINGS.map(b => `
    <tr>
      <td style="font-weight:600;color:var(--text)">${b.studentName}</td>
      <td>${b.propertyName}</td>
      <td>${b.ownerName}</td>
      <td>${formatDate(b.date)}</td>
      <td style="color:var(--accent);font-weight:600">${formatINR(b.amount)}</td>
      <td><span class="badge ${b.status === 'approved' ? 'badge-approved' : b.status === 'pending' ? 'badge-pending' : 'badge-rejected'}">${b.status}</span></td>
    </tr>`).join('');
}

// Override switchTab for admin
window.switchTab = function(id) {
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.style.display = '';

  document.querySelectorAll('[id^="snav-"]').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById('snav-' + id);
  if (navLink) navLink.classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.toggle('active', s.dataset.tab === id));

  if (id === 'properties') { renderPropsTable(); renderMetrics(); }
  if (id === 'users') renderUsersTable();
  if (id === 'bookings') renderBookingsTable();
  if (id === 'reports') setTimeout(initCharts, 100);
};
