// ── AUTH GUARD ──────────────────────────────────────────
// Redirect to login if no session exists
(function() {
  var name = localStorage.getItem('portalUser');
  if (!name) {
    window.location.replace('../auth.html');
  }
})();

// ── SESSION HELPERS ─────────────────────────────────────
function getSession() {
  return {
    name:   localStorage.getItem('portalUser') || 'Student',
    type:   localStorage.getItem('portalType') || 'student',
    isNew:  localStorage.getItem('portalLogin') === 'true'
  };
}

function doLogout() {
  localStorage.removeItem('portalUser');
  localStorage.removeItem('portalType');
  localStorage.removeItem('portalLogin');
  localStorage.removeItem('portalRole');
  localStorage.removeItem('authToken');
  localStorage.removeItem('portal');
  window.location.href = '../auth.html';
}

// ── TIME HELPERS ────────────────────────────────────────
function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getTodayDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── PORTAL META ─────────────────────────────────────────
function getPortalLabel(type) {
  return { student: 'Student Portal', faculty: 'Faculty Portal', parent: 'Parent Portal', enterprise: 'Enterprise Hub' }[type] || 'Student Portal';
}

function getPortalColor(type) {
  return { student: '#f97316', faculty: '#8b5cf6', parent: '#06b6d4', enterprise: '#10b981' }[type] || '#f97316';
}

// ── NAVBAR ──────────────────────────────────────────────
function initNavbar(session) {
  var color  = getPortalColor(session.type);
  var label  = getPortalLabel(session.type);
  var initial = session.name.charAt(0).toUpperCase();

  // Avatar
  var navAvatar = document.getElementById('navAvatar');
  if (navAvatar) {
    navAvatar.textContent = initial;
    navAvatar.style.background = 'linear-gradient(135deg,' + color + ',' + color + 'cc)';
    navAvatar.style.fontSize   = '0.85rem';
    navAvatar.style.fontWeight = '800';
    navAvatar.style.color      = '#fff';
  }

  // Name
  var navUserName = document.getElementById('navUserName');
  if (navUserName) navUserName.textContent = session.name;

  // Portal badge
  var navPortalBadge = document.getElementById('navPortalBadge');
  if (navPortalBadge) {
    navPortalBadge.textContent        = label;
    navPortalBadge.style.color        = color;
    navPortalBadge.style.background   = color + '18';
    navPortalBadge.style.border       = '1px solid ' + color + '44';
  }

  // Dropdown user info
  var dropdownAvatar = document.getElementById('dropdownAvatar');
  if (dropdownAvatar) {
    dropdownAvatar.textContent = initial;
    dropdownAvatar.style.background = 'linear-gradient(135deg,' + color + ',' + color + 'cc)';
  }
  var dropdownName = document.getElementById('dropdownName');
  if (dropdownName) dropdownName.textContent = session.name;
  var dropdownPortal = document.getElementById('dropdownPortal');
  if (dropdownPortal) {
    dropdownPortal.textContent = label;
    dropdownPortal.style.color = color;
  }
}

// ── WELCOME BANNER ──────────────────────────────────────
function initWelcome(session) {
  var banner = document.getElementById('welcomeBanner');
  if (!banner) return;

  var color   = getPortalColor(session.type);
  var label   = getPortalLabel(session.type);
  var firstName = session.name.split(' ')[0];

  banner.style.display = 'block';

  // "Welcome, Ammu! 👋"
  var greetEl = document.getElementById('welcomeGreeting');
  if (greetEl) greetEl.textContent = 'Welcome, ' + firstName + '! \uD83D\uDC4B';

  // "Good Morning, Ammu"
  var nameEl = document.getElementById('welcomeName');
  if (nameEl) nameEl.textContent = getGreeting() + ', ' + firstName;

  // Avatar
  var avatarEl = document.getElementById('welcomeAvatar');
  if (avatarEl) {
    avatarEl.textContent = session.name.charAt(0).toUpperCase();
    avatarEl.style.background = 'linear-gradient(135deg,' + color + ',' + color + 'cc)';
  }

  // Portal badge
  var badgeEl = document.getElementById('welcomePortalBadge');
  if (badgeEl) {
    badgeEl.textContent      = label;
    badgeEl.style.background = color + '18';
    badgeEl.style.color      = color;
    badgeEl.style.border     = '1px solid ' + color + '44';
  }

  // Date
  var dateEl = document.getElementById('welcomeDate');
  if (dateEl) dateEl.textContent = getTodayDate();

  // Animate in on fresh login
  if (session.isNew) {
    banner.classList.add('welcome-animate');
    sessionStorage.removeItem('portalLogin');
  }
}

function dismissWelcome() {
  var banner = document.getElementById('welcomeBanner');
  if (banner) {
    banner.classList.add('welcome-hide');
    setTimeout(function() { banner.style.display = 'none'; }, 400);
  }
}

// ── NAVIGATION ──────────────────────────────────────────
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function toggleDropdown() {
  var dd    = document.getElementById('profileDropdown');
  var arrow = document.getElementById('profileArrow');
  dd.classList.toggle('open');
  arrow.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  var profile = document.querySelector('.nav-profile');
  if (profile && !profile.contains(e.target)) {
    var dd    = document.getElementById('profileDropdown');
    var arrow = document.getElementById('profileArrow');
    if (dd)    dd.classList.remove('open');
    if (arrow) arrow.classList.remove('open');
  }
});

// ── COUNTER ANIMATION ───────────────────────────────────
function animateCounter(el, target, suffix) {
  if (!el) return;
  var current = 0;
  var step = target / 60;
  var timer = setInterval(function() {
    current += step;
    if (current >= target) {
      el.textContent = target + (suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + (suffix || '');
    }
  }, 25);
}

// ── HERO SEARCH ─────────────────────────────────────────
function handleHeroSearch() {
  var q = document.getElementById('heroSearch');
  var val = q ? q.value.trim() : '';
  window.location.href = val ? 'achievements.html?q=' + encodeURIComponent(val) : 'achievements.html';
}

// ── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var session = getSession();
  initNavbar(session);
  initWelcome(session);
  animateCounter(document.getElementById('hStat1'), 240, '+');
  animateCounter(document.getElementById('hStat2'), 312, '+');
  animateCounter(document.getElementById('hStat3'), 17, '');

  // Hero search on Enter
  var inp = document.getElementById('heroSearch');
  if (inp) inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') handleHeroSearch(); });

  // Filter buttons
  document.querySelectorAll('.hf-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.hf-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      if (f && f !== 'all') window.location.href = 'achievements.html?cat=' + f;
    });
  });
});
