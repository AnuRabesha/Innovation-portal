/* ═══════════════════════════════════════════
   SUBMIT.JS – Student Project Submission
═══════════════════════════════════════════ */

var STORE_KEY = 'portal_submissions';
var currentStep = 1;
var activeFilter = 'all';

// ── LOAD SUBMISSIONS FROM LOCALSTORAGE ────
function loadSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch(e) { return []; }
}

function saveSubmissions(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

// ── TAB NAVIGATION ────────────────────────
function showTab(tab) {
  ['submit','track','success'].forEach(function(t) {
    var el = document.getElementById('content-' + t);
    if (el) el.style.display = 'none';
  });
  ['submit','track'].forEach(function(t) {
    var btn = document.getElementById('tab-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  var target = document.getElementById('content-' + tab);
  if (target) target.style.display = 'block';
  if (tab === 'track') renderSubmissions();
  updateBadge();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateBadge() {
  var count = loadSubmissions().length;
  var badge = document.getElementById('submissionCount');
  if (badge) badge.textContent = count;
}

// ── STEP NAVIGATION ───────────────────────
function goStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;
  if (n === 3) buildSummary();

  document.getElementById('formStep' + currentStep).classList.remove('active');
  document.getElementById('step-dot-' + currentStep).classList.remove('active');
  if (n > currentStep) document.getElementById('step-dot-' + currentStep).classList.add('done');

  currentStep = n;
  document.getElementById('formStep' + currentStep).classList.add('active');
  document.getElementById('step-dot-' + currentStep).classList.add('active');

  // Update connector lines
  for (var i = 1; i <= 2; i++) {
    var line = document.getElementById('line-' + i);
    if (line) line.classList.toggle('done', i < currentStep);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── VALIDATION ────────────────────────────
function validateStep(step) {
  var ok = true;
  function req(id, errId) {
    var el = document.getElementById(id);
    var err = document.getElementById(errId);
    var val = el ? el.value.trim() : '';
    if (!val) {
      if (err) err.textContent = 'This field is required.';
      if (el) el.classList.add('invalid');
      ok = false;
    } else {
      if (err) err.textContent = '';
      if (el) el.classList.remove('invalid');
    }
  }
  if (step === 1) {
    req('f-name','err-name'); req('f-regno','err-regno');
    req('f-dept','err-dept'); req('f-batch','err-batch');
    req('f-guide','err-guide');
  }
  if (step === 2) {
    req('f-title','err-title'); req('f-category','err-category');
    req('f-year','err-year'); req('f-desc','err-desc');
  }
  return ok;
}

// ── SUMMARY BUILDER ───────────────────────
function buildSummary() {
  var g = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var catLabel = '';
  var catEl = document.getElementById('f-category');
  if (catEl && catEl.selectedIndex > 0) catLabel = catEl.options[catEl.selectedIndex].text;

  var rows = [
    ['Student Name', g('f-name')], ['Register No.', g('f-regno')],
    ['Department', g('f-dept')], ['Batch', g('f-batch')],
    ['Project Title', g('f-title')], ['Category', catLabel],
    ['Academic Year', g('f-year')], ['Guide', g('f-guide')],
  ];
  var grid = document.getElementById('summaryGrid');
  if (grid) {
    grid.innerHTML = rows.map(function(r) {
      return '<div class="summary-row"><span class="summary-key">' + r[0] + '</span><span class="summary-val">' + (r[1] || '—') + '</span></div>';
    }).join('');
  }
}

// ── FILE UPLOAD HANDLERS ──────────────────
function previewFile(input, previewId, zoneId) {
  var preview = document.getElementById(previewId);
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  preview.innerHTML = '';
  if (file.type.startsWith('image/')) {
    var img = document.createElement('img');
    img.className = 'upload-img-thumb';
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  } else {
    preview.innerHTML = '<div class="upload-file-chip"><i class="fas fa-file"></i>' + file.name + '</div>';
  }
  document.getElementById(zoneId).style.borderColor = 'rgba(34,197,94,0.5)';
}

function dragOver(e, zoneId) {
  e.preventDefault();
  document.getElementById(zoneId).classList.add('drag-over');
}
function dragLeave(zoneId) {
  document.getElementById(zoneId).classList.remove('drag-over');
}
function dropFile(e, inputId, zoneId, previewId) {
  e.preventDefault();
  dragLeave(zoneId);
  var input = document.getElementById(inputId);
  if (e.dataTransfer.files.length) {
    input.files = e.dataTransfer.files;
    previewFile(input, previewId, zoneId);
  }
}

// ── SUBMIT PROJECT ────────────────────────
function submitProject() {
  var declare = document.getElementById('f-declare');
  var errDec = document.getElementById('err-declare');
  if (!declare.checked) {
    errDec.textContent = 'Please accept the declaration to submit.';
    return;
  }
  errDec.textContent = '';

  var g = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var catEl = document.getElementById('f-category');
  var catLabel = catEl && catEl.selectedIndex > 0 ? catEl.options[catEl.selectedIndex].text : g('f-category');

  var docInput = document.getElementById('f-doc');
  var imgInput = document.getElementById('f-img');

  var submission = {
    id: 'SUB-' + Date.now().toString(36).toUpperCase(),
    submittedAt: new Date().toISOString(),
    status: 'pending',
    reviewNote: '',
    // Student Info
    name: g('f-name'), regno: g('f-regno'),
    dept: g('f-dept'), batch: g('f-batch'),
    email: g('f-email'), mobile: g('f-mobile'),
    team: g('f-team'), guide: g('f-guide'),
    // Project Details
    title: g('f-title'), category: g('f-category'), categoryLabel: catLabel,
    year: g('f-year'), desc: g('f-desc'),
    problem: g('f-problem'), tech: g('f-tech'),
    position: g('f-position'), event: g('f-event'),
    link: g('f-link'), date: g('f-date'),
    // Files (names only — no real upload in demo)
    docName: docInput && docInput.files[0] ? docInput.files[0].name : '',
    imgName: imgInput && imgInput.files[0] ? imgInput.files[0].name : '',
  };

  // Save to localStorage
  var list = loadSubmissions();
  list.unshift(submission);
  saveSubmissions(list);

  // Also push to DB.achievements as pending
  if (typeof DB !== 'undefined') {
    var nextId = DB.achievements.length ? Math.max.apply(null, DB.achievements.map(function(a){return a.id;})) + 1 : 1;
    DB.achievements.push({
      id: nextId, title: submission.title, student: submission.name,
      category: submission.category, batch: submission.batch,
      year: submission.year, event: submission.event || '—',
      org: submission.guide || '—', date: submission.date || '—',
      position: submission.position || '—', team: submission.team || null,
      desc: submission.desc || '', verified: false,
      submissionId: submission.id
    });
    DB.recompute();
  }

  // Show success
  document.getElementById('successId').textContent = submission.id;
  showTab('success');
  updateBadge();
}

// ── RESET FORM ────────────────────────────
function resetForm() {
  ['f-name','f-regno','f-email','f-mobile','f-team','f-guide',
   'f-title','f-desc','f-problem','f-tech','f-position','f-event','f-link','f-date'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.value = '';
  });
  ['f-dept','f-batch','f-category','f-year'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.selectedIndex = 0;
  });
  var dec = document.getElementById('f-declare'); if (dec) dec.checked = false;
  ['docPreview','imgPreview'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.innerHTML = '';
  });
  ['docZone','imgZone'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.borderColor = '';
  });
  currentStep = 1;
  for (var i = 1; i <= 3; i++) {
    var s = document.getElementById('formStep' + i); if (s) s.classList.toggle('active', i === 1);
    var d = document.getElementById('step-dot-' + i); if (d) { d.classList.toggle('active', i === 1); d.classList.remove('done'); }
  }
  for (var j = 1; j <= 2; j++) {
    var l = document.getElementById('line-' + j); if (l) l.classList.remove('done');
  }
  showTab('submit');
}

// ── RENDER SUBMISSIONS LIST ───────────────
function renderSubmissions() {
  var list = loadSubmissions();
  var q = (document.getElementById('trackSearch') ? document.getElementById('trackSearch').value : '').toLowerCase();
  var el = document.getElementById('submissionsList');
  if (!el) return;

  if (activeFilter !== 'all') list = list.filter(function(s) { return s.status === activeFilter; });
  if (q) list = list.filter(function(s) {
    return (s.title + s.name + s.regno + s.categoryLabel + s.year).toLowerCase().includes(q);
  });

  if (!list.length) {
    el.innerHTML = '<div class="empty-track"><i class="fas fa-inbox"></i><p>No submissions found.<br/><a href="#" onclick="showTab(\'submit\')">Submit your first project</a></p></div>';
    return;
  }

  el.innerHTML = list.map(function(s) {
    return '<div class="submission-card" onclick="openDetail(\'' + s.id + '\')">' +
      '<div class="sc-top">' +
        '<div><div class="sc-title">' + esc(s.title) + '</div><div class="sc-id">' + s.id + '</div></div>' +
        statusBadge(s.status) +
      '</div>' +
      '<div class="sc-meta">' +
        '<span class="sc-tag cat">' + esc(s.categoryLabel) + '</span>' +
        '<span class="sc-tag year">' + esc(s.year) + '</span>' +
        '<span class="sc-tag">' + esc(s.dept) + '</span>' +
      '</div>' +
      '<div class="sc-bottom">' +
        '<span class="sc-date"><i class="fas fa-clock"></i> ' + formatDate(s.submittedAt) + '</span>' +
        '<span class="sc-view">View Details <i class="fas fa-chevron-right"></i></span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function setFilter(btn, filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderSubmissions();
}

// ── DETAIL MODAL ──────────────────────────
function openDetail(id) {
  var list = loadSubmissions();
  var s = list.find(function(x) { return x.id === id; });
  if (!s) return;

  document.getElementById('modalTitle').textContent = s.title;
  document.getElementById('modalStatusBadge').innerHTML = statusBadge(s.status);

  var fields = [
    ['Student Name', s.name], ['Register Number', s.regno],
    ['Department', s.dept], ['Batch', s.batch],
    ['Email', s.email], ['Mobile', s.mobile],
    ['Team Members', s.team], ['Project Guide', s.guide],
  ];
  var projFields = [
    ['Category', s.categoryLabel], ['Academic Year', s.year],
    ['Description', s.desc], ['Problem Statement', s.problem],
    ['Technologies', s.tech], ['Achievement / Position', s.position],
    ['Event / Organizer', s.event], ['Event Date', s.date],
  ];

  var html = '<div style="font-size:0.7rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Student Information</div>';
  html += fields.filter(function(f){return f[1];}).map(function(f) {
    return '<div class="modal-field"><div class="modal-field-label">' + f[0] + '</div><div class="modal-field-val">' + esc(f[1]) + '</div></div>';
  }).join('');

  html += '<div class="modal-divider"></div>';
  html += '<div style="font-size:0.7rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Project Details</div>';
  html += projFields.filter(function(f){return f[1];}).map(function(f) {
    return '<div class="modal-field"><div class="modal-field-label">' + f[0] + '</div><div class="modal-field-val">' + esc(f[1]) + '</div></div>';
  }).join('');

  if (s.link) {
    html += '<div class="modal-field"><div class="modal-field-label">Demo / GitHub Link</div><div class="modal-field-val"><a href="' + esc(s.link) + '" target="_blank" class="modal-field-link">' + esc(s.link) + '</a></div></div>';
  }
  if (s.docName || s.imgName) {
    html += '<div class="modal-divider"></div>';
    if (s.docName) html += '<div class="modal-field"><div class="modal-field-label">Document</div><div class="modal-field-val"><span class="upload-file-chip"><i class="fas fa-file"></i>' + esc(s.docName) + '</span></div></div>';
    if (s.imgName) html += '<div class="modal-field"><div class="modal-field-label">Image</div><div class="modal-field-val"><span class="upload-file-chip"><i class="fas fa-image"></i>' + esc(s.imgName) + '</span></div></div>';
  }
  if (s.reviewNote) {
    html += '<div class="review-note"><strong>Faculty Note:</strong> ' + esc(s.reviewNote) + '</div>';
  }

  document.getElementById('modalBody').innerHTML = html;

  // Footer: faculty simulation buttons
  var footer = '<span style="font-size:0.72rem;color:var(--muted);align-self:center;">Submitted: ' + formatDate(s.submittedAt) + '</span>';
  if (s.status === 'pending' || s.status === 'changes') {
    footer += '<button class="btn-next" style="padding:8px 16px;font-size:0.78rem;" onclick="reviewAction(\'' + id + '\',\'approved\')"><i class="fas fa-check"></i> Approve</button>';
    footer += '<button style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:8px 16px;border-radius:999px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;" onclick="reviewAction(\'' + id + '\',\'rejected\')"><i class="fas fa-times"></i> Reject</button>';
    footer += '<button style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);padding:8px 16px;border-radius:999px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;" onclick="requestChanges(\'' + id + '\')"><i class="fas fa-edit"></i> Request Changes</button>';
  }
  document.getElementById('modalFooter').innerHTML = footer;

  document.getElementById('detailModal').classList.add('open');
}

function closeModal() {
  document.getElementById('detailModal').classList.remove('open');
}

function reviewAction(id, action) {
  var list = loadSubmissions();
  var s = list.find(function(x) { return x.id === id; });
  if (!s) return;
  s.status = action;
  if (action === 'approved') s.reviewNote = 'Approved by faculty. Project will be published on the showcase.';
  if (action === 'rejected') s.reviewNote = 'Rejected by faculty. Please review and resubmit if needed.';

  // Sync with DB.achievements
  if (typeof DB !== 'undefined') {
    var ach = DB.achievements.find(function(a) { return a.submissionId === id; });
    if (ach) { ach.verified = (action === 'approved'); DB.recompute(); }
  }

  saveSubmissions(list);
  closeModal();
  renderSubmissions();
}

function requestChanges(id) {
  var note = prompt('Enter the changes required for the student:');
  if (note === null) return;
  var list = loadSubmissions();
  var s = list.find(function(x) { return x.id === id; });
  if (!s) return;
  s.status = 'changes';
  s.reviewNote = note || 'Please review and update your submission.';
  saveSubmissions(list);
  closeModal();
  renderSubmissions();
}

// ── HELPERS ───────────────────────────────
function statusBadge(status) {
  var map = {
    pending:  ['status-pending',  'fas fa-clock',      'Pending Verification'],
    approved: ['status-approved', 'fas fa-check-circle','Approved'],
    rejected: ['status-rejected', 'fas fa-times-circle','Rejected'],
    changes:  ['status-changes',  'fas fa-edit',        'Changes Required'],
  };
  var m = map[status] || map.pending;
  return '<span class="status-badge ' + m[0] + '"><i class="' + m[1] + '"></i>' + m[2] + '</span>';
}

function formatDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateBadge();
  // Set today as default date
  var dateEl = document.getElementById('f-date');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
  // Check URL hash for direct tab open
  if (window.location.hash === '#track') showTab('track');
});
