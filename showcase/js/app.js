/* ═══════════════════════════════════════════
   CSE ACHIEVEMENT SHOWCASE PORTAL – APP.JS
   Part 1: Navigation, Auth, Home, Cards
═══════════════════════════════════════════ */

// ── PAGE NAVIGATION ──────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'home')         renderHome();
  if (id === 'performers')   renderPerformers();
  if (id === 'achievements') renderAchievements();
  if (id === 'categories')   renderAllCategories();
  if (id === 'analytics')    renderAnalytics();
  if (id === 'yearwise')     renderYearwise();
  if (id === 'batchwise')    renderBatchwise();
  if (id === 'dashboard')    { if (!Auth.isStaff()) { openLoginModal(); return; } renderDashboard(); }
}

function toggleMobileNav() {
  const links = document.getElementById('navLinks');
  const isHidden = links.style.display !== 'flex';
  links.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    Object.assign(links.style, {
      flexDirection:'column', position:'absolute',
      top:'64px', left:'0', right:'0',
      background:'#0f0f0f', padding:'12px',
      borderBottom:'1px solid rgba(249,115,22,0.2)', zIndex:'999'
    });
  }
}

// ── AUTH ─────────────────────────────────
function openLoginModal() { openModal('loginModal'); }

function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPassword').value;
  if (Auth.login(email, pass)) {
    closeModal('loginModal');
    updateNavAuth();
    showPage('dashboard');
    showToast('Welcome, ' + Auth.currentUser.name + '!', 'success');
  } else {
    document.getElementById('loginErr').textContent = 'Invalid email or password.';
  }
}

function doLogout() {
  Auth.logout();
  updateNavAuth();
  showPage('home');
  showToast('Logged out successfully.', 'success');
}

function updateNavAuth() {
  const s = Auth.isStaff();
  document.getElementById('navPublic').style.display = s ? 'none' : 'block';
  document.getElementById('navStaff').style.display  = s ? 'flex' : 'none';
  if (s) document.getElementById('navUserName').textContent = Auth.currentUser.name;
}

// ── MODALS ───────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
  updateNavAuth();
  renderHome();
  const nh = document.getElementById('nav-home');
  if (nh) nh.classList.add('active');
});

// ── TOAST ────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = 'toast ' + (type || 'success') + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── CATEGORY HELPERS ─────────────────────
function getCat(id) {
  return DB.categories.find(c => c.id === id) || { label: id, icon: '⭐', color: '#888' };
}

function catBadgeHTML(catId) {
  const c = getCat(catId);
  return '<span class="ach-cat-badge" style="background:' + c.color + '22;color:' + c.color + ';border:1px solid ' + c.color + '44">' + c.icon + ' ' + c.label + '</span>';
}

// ── CHART HELPERS ────────────────────────
function destroyChart(id) {
  const ex = Chart.getChart(id);
  if (ex) ex.destroy();
}

function baseChartOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };
}

// ══════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════
function renderHome() {}

// ══════════════════════════════════════════
// TOP PERFORMERS PAGE
// ══════════════════════════════════════════
function renderPerformers() {
  var studentMap = {};
  DB.achievements.filter(function(a) { return a.verified; }).forEach(function(a) {
    if (!studentMap[a.student]) {
      studentMap[a.student] = { student: a.student, batch: a.batch, count: 0, achs: [] };
    }
    studentMap[a.student].count++;
    studentMap[a.student].achs.push(a);
  });
  var ranked = Object.values(studentMap).sort(function(a, b) { return b.count - a.count; });
  var el = document.getElementById('performersList');
  if (!ranked.length) {
    el.innerHTML = '<p style="color:var(--muted2);padding:24px;">No verified achievements yet.</p>';
    return;
  }
  var medals = ['', '🥇', '🥈', '🥉'];
  el.innerHTML = ranked.map(function(p, i) {
    var rank = i + 1;
    var rankLabel = rank <= 3 ? medals[rank] : '#' + rank;
    var rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c3a' : 'var(--orange)';
    var cats = [...new Set(p.achs.map(function(a) { return a.category; }))]
      .map(function(cid) { return getCat(cid).icon; }).join(' ');
    var latestYear = p.achs[p.achs.length - 1].year;
    var topAch = p.achs.slice().sort(function(a,b){ return b.id - a.id; })[0];
    return '<div class="performer-row" onclick="openAchModal(' + topAch.id + ')">' +
      '<div class="performer-row-rank" style="color:' + rankColor + '">' + rankLabel + '</div>' +
      '<div class="performer-row-avatar">' + p.student.charAt(0).toUpperCase() + '</div>' +
      '<div class="performer-row-info">' +
        '<div class="performer-row-name">' + p.student + '</div>' +
        '<div class="performer-row-meta">Batch: ' + p.batch + ' &nbsp;·&nbsp; Year: ' + latestYear + ' &nbsp;·&nbsp; ' + cats + '</div>' +
        '<div class="performer-row-ach">' + topAch.title + '</div>' +
      '</div>' +
      '<div class="performer-row-score"><span>' + p.count + '</span><small>achievements</small></div>' +
    '</div>';
  }).join('');
}

function renderStatsGrid(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(s =>
    '<div class="stat-card">' +
      '<div class="stat-icon">' + s.icon + '</div>' +
      '<div class="stat-num" data-target="' + s.num + '">0</div>' +
      '<div class="stat-label">' + s.label + '</div>' +
    '</div>'
  ).join('');
  el.querySelectorAll('.stat-num').forEach(n => animateCount(n, parseInt(n.dataset.target)));
}

// ── ACHIEVEMENT CARD ─────────────────────
function achCardHTML(a) {
  const verBadge = a.verified
    ? '<span class="verified-badge">✓ Verified</span>'
    : '<span class="pending-badge">⏳ Pending</span>';
  return '<div class="ach-card" onclick="openAchModal(' + a.id + ')">' +
    '<div class="ach-card-top">' + catBadgeHTML(a.category) + verBadge + '</div>' +
    '<div class="ach-title">' + a.title + '</div>' +
    '<div class="ach-meta">' +
      '<div class="ach-meta-row"><span>👤</span><span>' + a.student + (a.team ? ' · ' + a.team : '') + '</span></div>' +
      '<div class="ach-meta-row"><span>📅</span><span>' + a.batch + ' · ' + a.year + '</span></div>' +
      '<div class="ach-meta-row"><span>🏛️</span><span>' + a.event + '</span></div>' +
    '</div>' +
    '<span class="ach-position">' + a.position + '</span>' +
  '</div>';
}

// ── ACHIEVEMENT MODAL ────────────────────
function openAchModal(id) {
  const a = DB.achievements.find(x => x.id === id);
  if (!a) return;
  const c = getCat(a.category);
  document.getElementById('modalIcon').textContent  = c.icon;
  document.getElementById('modalTitle').textContent = a.title;
  document.getElementById('modalBadges').innerHTML  =
    catBadgeHTML(a.category) +
    (a.verified ? '<span class="verified-badge">✓ Verified</span>' : '<span class="pending-badge">⏳ Pending</span>');
  const fields = [
    ['Student', a.student], ['Team', a.team || '—'],
    ['Batch', a.batch],     ['Academic Year', a.year],
    ['Event', a.event],     ['Organizer', a.org],
    ['Date', a.date],       ['Position', a.position],
  ];
  document.getElementById('modalGrid').innerHTML = fields.map(function(f) {
    return '<div class="modal-field"><label>' + f[0] + '</label><p>' + f[1] + '</p></div>';
  }).join('');
  document.getElementById('modalDesc').textContent = a.desc;
  openModal('achModal');
}

// ══════════════════════════════════════════
// ACHIEVEMENTS PAGE
// ══════════════════════════════════════════
function renderAchievements() {
  const sel = document.getElementById('filterCat');
  if (sel && sel.options.length === 1) {
    DB.categories.forEach(function(c) {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.label;
      sel.appendChild(o);
    });
  }
  filterAchievements();
}

function filterAchievements() {
  const q      = (document.getElementById('searchInput') ? document.getElementById('searchInput').value : '').toLowerCase();
  const year   = document.getElementById('filterYear')   ? document.getElementById('filterYear').value   : '';
  const batch  = document.getElementById('filterBatch')  ? document.getElementById('filterBatch').value  : '';
  const cat    = document.getElementById('filterCat')    ? document.getElementById('filterCat').value    : '';
  const status = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';

  let list = Auth.isStaff() ? DB.achievements : DB.achievements.filter(function(a) { return a.verified; });

  if (q)      list = list.filter(function(a) {
    return a.title.toLowerCase().includes(q) ||
           a.student.toLowerCase().includes(q) ||
           a.event.toLowerCase().includes(q) ||
           (a.team && a.team.toLowerCase().includes(q));
  });
  if (year)   list = list.filter(function(a) { return a.year === year; });
  if (batch)  list = list.filter(function(a) { return a.batch === batch; });
  if (cat)    list = list.filter(function(a) { return a.category === cat; });
  if (status) list = list.filter(function(a) { return String(a.verified) === status; });

  const grid  = document.getElementById('achGrid');
  const count = document.getElementById('achCount');
  if (count) count.textContent = list.length + ' achievements found';
  if (grid)  grid.innerHTML = list.length
    ? list.map(achCardHTML).join('')
    : '<p style="color:var(--muted2);padding:24px;">No achievements found.</p>';
}

// ══════════════════════════════════════════
// CATEGORIES PAGE
// ══════════════════════════════════════════
var CAT_GROUPS = ['Innovation', 'Research', 'Technical', 'Professional', 'Recognition'];

function renderCatGroups(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CAT_GROUPS.map(function(group) {
    const cats = DB.categories.filter(function(c) { return c.group === group; });
    return '<div class="cat-group">' +
      '<div class="cat-group-title">' + group + '</div>' +
      '<div class="cat-grid">' +
        cats.map(function(c) {
          return '<div class="cat-card" onclick="filterByCat(\'' + c.id + '\')">' +
            '<div class="cat-icon-wrap" style="background:' + c.color + '22;">' + c.icon + '</div>' +
            '<div class="cat-info">' +
              '<div class="cat-name">' + c.label + '</div>' +
              '<div class="cat-count">' + c.count + ' achievements</div>' +
            '</div>' +
            '<div class="cat-pct">' + getCategoryPercent(c.id) + '%</div>' +
          '</div>';
        }).join('') +
      '</div></div>';
  }).join('');
}

function renderAllCategories() { renderCatGroups('allCatGroups'); }

function filterByCat(catId) {
  showPage('achievements');
  setTimeout(function() {
    const sel = document.getElementById('filterCat');
    if (sel) { sel.value = catId; filterAchievements(); }
  }, 50);
}

// ══════════════════════════════════════════
// ANALYTICS PAGE
// ══════════════════════════════════════════
function renderAnalytics() {
  renderStatsGrid('analyticsStats', [
    { icon: '🎓', num: DB.stats.totalStudents,            label: 'Total Students' },
    { icon: '🏆', num: DB.stats.totalAchievements,        label: 'Total Achievements' },
    { icon: '👥', num: DB.stats.studentsWithAchievements, label: 'Students with Achievements' },
    { icon: '✅', num: DB.stats.verifiedAchievements,     label: 'Verified Achievements' },
  ]);

  destroyChart('catChart');
  new Chart(document.getElementById('catChart'), {
    type: 'doughnut',
    data: {
      labels: DB.categories.map(function(c) { return c.label; }),
      datasets: [{ data: DB.categories.map(function(c) { return c.count; }), backgroundColor: DB.categories.map(function(c) { return c.color; }), borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } } }
  });

  destroyChart('yearChart');
  new Chart(document.getElementById('yearChart'), {
    type: 'bar',
    data: {
      labels: DB.yearStats.map(function(y) { return y.year; }),
      datasets: [
        { label: 'Achievements', data: DB.yearStats.map(function(y) { return y.total; }), backgroundColor: '#f97316', borderRadius: 6 },
        { label: 'Students',     data: DB.yearStats.map(function(y) { return y.students; }), backgroundColor: '#3b82f6', borderRadius: 6 }
      ]
    },
    options: baseChartOpts()
  });

  destroyChart('batchChart');
  new Chart(document.getElementById('batchChart'), {
    type: 'bar',
    data: {
      labels: DB.batches.map(function(b) { return b.batch; }),
      datasets: [
        { label: 'Achievements',     data: DB.batches.map(function(b) { return b.achievements; }), backgroundColor: '#f97316', borderRadius: 6 },
        { label: 'Students w/ Ach.', data: DB.batches.map(function(b) { return b.withAch; }),      backgroundColor: '#3b82f6', borderRadius: 6 }
      ]
    },
    options: baseChartOpts()
  });

  const top8 = DB.categories.slice().sort(function(a,b){ return b.count - a.count; }).slice(0, 8);
  const cp = document.getElementById('catProgress');
  if (cp) {
    cp.innerHTML = top8.map(function(c) {
      const pct = getCategoryPercent(c.id);
      return '<div class="progress-item">' +
        '<div class="progress-label"><span>' + c.icon + ' ' + c.label + '</span><span>' + pct + '%</span></div>' +
        '<div class="progress-bar-bg"><div class="progress-fill" style="width:0%;background:' + c.color + '" data-w="' + pct + '"></div></div>' +
      '</div>';
    }).join('');
    setTimeout(function() {
      cp.querySelectorAll('.progress-fill').forEach(function(b) { b.style.width = b.dataset.w + '%'; });
    }, 100);
  }
}

// ══════════════════════════════════════════
// YEAR-WISE PAGE
// ══════════════════════════════════════════
var selectedYear = DB.yearStats[3].year;

function renderYearwise() {
  const tabs = document.getElementById('yearTabs');
  if (!tabs) return;
  tabs.innerHTML = DB.yearStats.map(function(y) {
    return '<button class="sel-tab ' + (y.year === selectedYear ? 'active' : '') + '" onclick="selectYear(\'' + y.year + '\')">' + y.year + '</button>';
  }).join('');
  renderYearDetail();
  destroyChart('yearCompareChart');
  new Chart(document.getElementById('yearCompareChart'), {
    type: 'line',
    data: {
      labels: DB.yearStats.map(function(y) { return y.year; }),
      datasets: [
        { label: 'Achievements', data: DB.yearStats.map(function(y) { return y.total; }),    borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', tension: 0.4, fill: true },
        { label: 'Students',     data: DB.yearStats.map(function(y) { return y.students; }), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',  tension: 0.4, fill: true }
      ]
    },
    options: baseChartOpts()
  });
}

function selectYear(y) {
  selectedYear = y;
  document.querySelectorAll('#yearTabs .sel-tab').forEach(function(t) {
    t.classList.toggle('active', t.textContent === y);
  });
  renderYearDetail();
}

function renderYearDetail() {
  const y = DB.yearStats.find(function(x) { return x.year === selectedYear; });
  if (!y) return;
  const rate = calcAchievementRate(y.students, DB.stats.totalStudents);
  const rows = [
    ['🎓','Total Students', DB.stats.totalStudents],
    ['👥','Students w/ Achievements', y.students],
    ['📈','Achievement Rate', rate + '%'],
    ['🏆','Total Achievements', y.total],
    ['💻','Hackathons', y.hackathon],
    ['📄','Research Papers', y.research],
    ['🏛️','Patents', y.patent],
    ['🎓','Certifications', y.cert],
    ['🥇','Awards', y.award],
  ];
  document.getElementById('yearDetail').innerHTML =
    '<div class="stats-grid" style="padding:0;margin-bottom:24px;">' +
    rows.map(function(r) {
      return '<div class="stat-card"><div class="stat-icon">' + r[0] + '</div><div class="stat-num">' + r[2] + '</div><div class="stat-label">' + r[1] + '</div></div>';
    }).join('') + '</div>';
}

// ══════════════════════════════════════════
// BATCH-WISE PAGE
// ══════════════════════════════════════════
var selectedBatch = DB.batches[2].batch;

function renderBatchwise() {
  const tabs = document.getElementById('batchTabs');
  if (!tabs) return;
  tabs.innerHTML = DB.batches.map(function(b) {
    return '<button class="sel-tab ' + (b.batch === selectedBatch ? 'active' : '') + '" onclick="selectBatch(\'' + b.batch + '\')">' + b.batch + '</button>';
  }).join('');
  renderBatchDetail();
  destroyChart('batchCompareChart');
  new Chart(document.getElementById('batchCompareChart'), {
    type: 'bar',
    data: {
      labels: DB.batches.map(function(b) { return b.batch; }),
      datasets: [
        { label: 'Achievements',   data: DB.batches.map(function(b) { return b.achievements; }), backgroundColor: '#f97316', borderRadius: 6 },
        { label: 'Students w/Ach', data: DB.batches.map(function(b) { return b.withAch; }),      backgroundColor: '#8b5cf6', borderRadius: 6 },
        { label: 'Total Students', data: DB.batches.map(function(b) { return b.students; }),     backgroundColor: '#3b82f6', borderRadius: 6 }
      ]
    },
    options: baseChartOpts()
  });
}

function selectBatch(b) {
  selectedBatch = b;
  document.querySelectorAll('#batchTabs .sel-tab').forEach(function(t) {
    t.classList.toggle('active', t.textContent === b);
  });
  renderBatchDetail();
}

function renderBatchDetail() {
  const b = DB.batches.find(function(x) { return x.batch === selectedBatch; });
  if (!b) return;
  const rate = calcAchievementRate(b.withAch, b.students);
  const statRows = [
    ['🎓','Total Students', b.students],
    ['👥','Students w/ Achievements', b.withAch],
    ['📈','Achievement Rate', rate + '%'],
    ['🏆','Total Achievements', b.achievements],
  ];
  const bars = DB.categories.slice(0, 8).map(function(c) {
    const n = DB.achievements.filter(function(a) { return a.batch === selectedBatch && a.category === c.id; }).length;
    const pct = b.achievements ? ((n / b.achievements) * 100).toFixed(1) : 0;
    return '<div class="progress-item">' +
      '<div class="progress-label"><span>' + c.icon + ' ' + c.label + '</span><span>' + pct + '%</span></div>' +
      '<div class="progress-bar-bg"><div class="progress-fill" style="width:' + pct + '%;background:' + c.color + '"></div></div>' +
    '</div>';
  }).join('');
  document.getElementById('batchDetail').innerHTML =
    '<div class="stats-grid" style="padding:0;margin-bottom:24px;">' +
    statRows.map(function(r) {
      return '<div class="stat-card"><div class="stat-icon">' + r[0] + '</div><div class="stat-num">' + r[2] + '</div><div class="stat-label">' + r[1] + '</div></div>';
    }).join('') + '</div>' +
    '<div class="form-card"><div class="progress-row">' + bars + '</div></div>';
}

// ══════════════════════════════════════════
// STAFF DASHBOARD
// ══════════════════════════════════════════
function renderDashboard() {
  renderDashStats();
  destroyChart('dashCatChart');
  new Chart(document.getElementById('dashCatChart'), {
    type: 'doughnut',
    data: {
      labels: DB.categories.map(function(c) { return c.label; }),
      datasets: [{ data: DB.categories.map(function(c) { return c.count; }), backgroundColor: DB.categories.map(function(c) { return c.color; }), borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } } }
  });
  destroyChart('dashYearChart');
  new Chart(document.getElementById('dashYearChart'), {
    type: 'bar',
    data: {
      labels: DB.yearStats.map(function(y) { return y.year; }),
      datasets: [
        { label: 'Achievements', data: DB.yearStats.map(function(y) { return y.total; }),    backgroundColor: '#f97316', borderRadius: 6 },
        { label: 'Students',     data: DB.yearStats.map(function(y) { return y.students; }), backgroundColor: '#3b82f6', borderRadius: 6 }
      ]
    },
    options: baseChartOpts()
  });
  renderRecentTable();
  populateCategorySelects();
}

function renderDashStats() {
  const el = document.getElementById('dashStats');
  if (!el) return;
  const rate = calcAchievementRate(DB.stats.studentsWithAchievements, DB.stats.totalStudents);
  const pending = DB.achievements.filter(function(a) { return !a.verified; }).length;
  el.innerHTML = [
    ['🏆', DB.stats.totalAchievements,   'Total Achievements'],
    ['✅', DB.stats.verifiedAchievements, 'Verified'],
    ['⏳', pending,                       'Pending'],
    ['📈', rate + '%',                    'Achievement Rate'],
  ].map(function(r) {
    return '<div class="stat-card"><div class="stat-icon">' + r[0] + '</div><div class="stat-num">' + r[1] + '</div><div class="stat-label">' + r[2] + '</div></div>';
  }).join('');
}

function showDashTab(tab) {
  document.querySelectorAll('[id^="dash-"]').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.sidebar-item').forEach(function(el) { el.classList.remove('active'); });
  const content = document.getElementById('dash-' + tab);
  const sideBtn = document.getElementById('dt-' + tab);
  if (content) content.style.display = 'block';
  if (sideBtn) sideBtn.classList.add('active');
  if (tab === 'manage')   renderManageTable();
  if (tab === 'pending')  renderPendingTable();
  if (tab === 'students') renderStudentsTable();
  if (tab === 'batches')  renderBatchesTable();
}

function buildTable(headers, rowsHTML) {
  return '<table><thead><tr>' +
    headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') +
    '</tr></thead><tbody>' + rowsHTML + '</tbody></table>';
}

function renderRecentTable() {
  const el = document.getElementById('recentTable');
  if (!el) return;
  const recent = DB.achievements.slice(-6).reverse();
  el.innerHTML = buildTable(
    ['Title','Student','Category','Year','Status','Actions'],
    recent.map(function(a) {
      const c = getCat(a.category);
      const approveBtn = !a.verified && Auth.isStaff()
        ? '<button class="action-btn approve" onclick="verifyAch(' + a.id + ')">Approve</button>' : '';
      return '<tr>' +
        '<td>' + a.title + '</td><td>' + a.student + '</td>' +
        '<td>' + c.icon + ' ' + c.label + '</td><td>' + a.year + '</td>' +
        '<td>' + (a.verified ? '<span class="verified-badge">✓ Verified</span>' : '<span class="pending-badge">⏳ Pending</span>') + '</td>' +
        '<td><button class="action-btn" onclick="openAchModal(' + a.id + ')">View</button>' + approveBtn + '</td>' +
      '</tr>';
    }).join('')
  );
}

function renderManageTable() {
  const el = document.getElementById('manageTable');
  if (!el) return;
  el.innerHTML = buildTable(
    ['#','Title','Student','Category','Batch','Year','Status','Actions'],
    DB.achievements.map(function(a) {
      const c = getCat(a.category);
      return '<tr>' +
        '<td>' + a.id + '</td><td>' + a.title + '</td><td>' + a.student + '</td>' +
        '<td>' + c.icon + ' ' + c.label + '</td><td>' + a.batch + '</td><td>' + a.year + '</td>' +
        '<td>' + (a.verified ? '<span class="verified-badge">✓</span>' : '<span class="pending-badge">⏳</span>') + '</td>' +
        '<td>' +
          '<button class="action-btn" onclick="openAchModal(' + a.id + ')">View</button>' +
          '<button class="action-btn reject" onclick="deleteAch(' + a.id + ')">Delete</button>' +
        '</td></tr>';
    }).join('')
  );
}

function renderPendingTable() {
  const el = document.getElementById('pendingTable');
  if (!el) return;
  const pending = DB.achievements.filter(function(a) { return !a.verified; });
  if (!pending.length) {
    el.innerHTML = '<p style="padding:20px;color:var(--muted2);">No pending achievements.</p>';
    return;
  }
  el.innerHTML = buildTable(
    ['Title','Student','Category','Year','Actions'],
    pending.map(function(a) {
      const c = getCat(a.category);
      return '<tr>' +
        '<td>' + a.title + '</td><td>' + a.student + '</td>' +
        '<td>' + c.icon + ' ' + c.label + '</td><td>' + a.year + '</td>' +
        '<td>' +
          '<button class="action-btn approve" onclick="verifyAch(' + a.id + ')">✓ Approve</button>' +
          '<button class="action-btn reject"  onclick="deleteAch(' + a.id + ')">✕ Reject</button>' +
          '<button class="action-btn"         onclick="openAchModal(' + a.id + ')">View</button>' +
        '</td></tr>';
    }).join('')
  );
}

function renderStudentsTable() {
  const el = document.getElementById('studentsTable');
  if (!el) return;
  const seen = {};
  const students = DB.achievements.filter(function(a) {
    if (seen[a.student]) return false;
    seen[a.student] = true; return true;
  });
  el.innerHTML = buildTable(
    ['Student Name','Batch','Total Achievements','Verified'],
    students.map(function(a) {
      const all = DB.achievements.filter(function(x) { return x.student === a.student; });
      const ver = all.filter(function(x) { return x.verified; }).length;
      return '<tr><td>' + a.student + '</td><td>' + a.batch + '</td><td>' + all.length + '</td><td>' + ver + '</td></tr>';
    }).join('')
  );
}

function renderBatchesTable() {
  const el = document.getElementById('batchesTable');
  if (!el) return;
  el.innerHTML = buildTable(
    ['Batch','Total Students','With Achievements','Achievement Rate','Total Achievements'],
    DB.batches.map(function(b) {
      return '<tr><td>' + b.batch + '</td><td>' + b.students + '</td><td>' + b.withAch + '</td><td>' + calcAchievementRate(b.withAch, b.students) + '%</td><td>' + b.achievements + '</td></tr>';
    }).join('')
  );
}

// ── VERIFY / DELETE ──────────────────────
function verifyAch(id) {
  if (!Auth.isStaff()) return;
  const a = DB.achievements.find(function(x) { return x.id === id; });
  if (a && !a.verified) { a.verified = true; }
  DB.recompute();
  showToast('Achievement verified!', 'success');
  renderDashStats(); renderRecentTable(); renderPendingTable(); renderManageTable();
}

function deleteAch(id) {
  if (!Auth.isStaff()) return;
  const idx = DB.achievements.findIndex(function(x) { return x.id === id; });
  if (idx > -1) DB.achievements.splice(idx, 1);
  DB.recompute();
  showToast('Achievement removed.', 'error');
  renderManageTable(); renderPendingTable(); renderDashStats();
}

// ── ADD ACHIEVEMENT ──────────────────────
function populateCategorySelects() {
  ['a-category', 'r-cat'].forEach(function(selId) {
    const sel = document.getElementById(selId);
    if (!sel || sel.options.length > 1) return;
    DB.categories.forEach(function(c) {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.label;
      sel.appendChild(o);
    });
  });
}

function submitAchievement(e) {
  e.preventDefault();
  if (!Auth.isStaff()) return;

  const titleVal = document.getElementById('a-title').value.trim().toLowerCase();
  const isDuplicate = DB.achievements.some(function(a) {
    return a.title.trim().toLowerCase() === titleVal;
  });
  if (isDuplicate) {
    showToast('Duplicate! This project already exists for this student.', 'error');
    return;
  }

  const newId = Math.max.apply(null, DB.achievements.map(function(a) { return a.id; })) + 1;
  DB.achievements.push({
    id:       newId,
    title:    document.getElementById('a-title').value,
    student:  document.getElementById('a-student').value,
    category: document.getElementById('a-category').value,
    batch:    document.getElementById('a-batch').value,
    year:     document.getElementById('a-year').value,
    event:    document.getElementById('a-event').value || '—',
    org:      document.getElementById('a-org').value   || '—',
    date:     document.getElementById('a-date').value  || '—',
    position: document.getElementById('a-position').value || '—',
    team:     document.getElementById('a-team').value  || null,
    desc:     document.getElementById('a-desc').value  || '',
    verified: false,
  });
  DB.recompute();
  DB.stats.totalAchievements = DB.achievements.length;
  showToast('Achievement added! Pending verification.', 'success');
  resetAddForm();
  showDashTab('pending');
}

function resetAddForm() {
  const f = document.getElementById('addAchForm');
  if (f) f.reset();
}

// ── REPORTS ──────────────────────────────
function generateReport(type) {
  const year  = document.getElementById('r-year').value;
  const batch = document.getElementById('r-batch').value;
  const cat   = document.getElementById('r-cat').value;
  let list = DB.achievements.filter(function(a) { return a.verified; });
  if (year)  list = list.filter(function(a) { return a.year === year; });
  if (batch) list = list.filter(function(a) { return a.batch === batch; });
  if (cat)   list = list.filter(function(a) { return a.category === cat; });

  if (type === 'csv') {
    const header = 'Title,Student,Category,Batch,Year,Event,Position';
    const rows = list.map(function(a) {
      return '"' + a.title + '","' + a.student + '","' + getCat(a.category).label + '","' + a.batch + '","' + a.year + '","' + a.event + '","' + a.position + '"';
    });
    const blob = new Blob([[header].concat(rows).join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cse_achievements.csv';
    link.click();
    showToast('CSV exported!', 'success');
  }

  if (type === 'print') {
    const preview = document.getElementById('reportPreview');
    if (!preview) return;
    preview.innerHTML = '<div class="form-card">' +
      '<h3 style="margin-bottom:16px;color:var(--orange);">CSE Achievement Report ' + (year || 'All Years') + '</h3>' +
      '<p style="font-size:0.82rem;color:var(--muted2);margin-bottom:16px;">Total: <strong style="color:var(--text)">' + list.length + '</strong></p>' +
      '<div class="table-wrap">' +
        buildTable(['Title','Student','Category','Year','Position'],
          list.map(function(a) {
            return '<tr><td>' + a.title + '</td><td>' + a.student + '</td><td>' + getCat(a.category).label + '</td><td>' + a.year + '</td><td>' + a.position + '</td></tr>';
          }).join('')) +
      '</div></div>';
    showToast('Report generated!', 'success');
  }
}
