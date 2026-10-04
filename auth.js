/* ══════════════════════════════════════════
   INNOVATION PORTAL – AUTH LOGIC
   Works fully in browser (demo mode).
   Connect backend API to enable real OTPs.
══════════════════════════════════════════ */

// ── CONFIG ───────────────────────────────
var BACKEND_URL   = 'http://localhost:5000';
var OTP_DURATION  = 300;         // 5 minutes
var RESEND_COOLDOWN = 30;        // seconds
var MAX_RESEND    = 3;
var DEMO_MODE     = true;

// ── STATE ────────────────────────────────
var currentPortal      = '';
var currentTab         = 'register';
var otpTarget          = '';
var otpChannel         = 'email';
var countdownInterval  = null;
var resendInterval     = null;
var resendAttempts     = 0;
var formDataCache      = {};
var demoOTP            = '';     // Only used in demo mode

// ── PORTAL META ──────────────────────────
var portalMeta = {
  student:    { tag:'Student Portal',  illustration:'🎓', desc:'Access your personalized student dashboard, track achievements, and explore innovation opportunities.' },
  faculty:    { tag:'Faculty Portal',  illustration:'📋', desc:'Manage your courses, track student progress, and collaborate on research and innovation projects.' },
  parent:     { tag:'Parent Portal',   illustration:'🏠', desc:"Stay connected with your child's academic journey and monitor their achievements in real time." },
  enterprise: { tag:'Enterprise Hub',  illustration:'🏢', desc:'Connect with top engineering talent, post opportunities, and collaborate with the CSE department.' }
};

// ══════════════════════════════════════════
// SCREEN NAVIGATION
// ══════════════════════════════════════════
function openAuth(portal) {
  currentPortal  = portal;
  currentTab     = 'register';
  resendAttempts = 0;

  document.getElementById('selectorScreen').classList.remove('active');
  document.getElementById('authScreen').classList.add('active');

  var m = portalMeta[portal];
  document.getElementById('portalTag').textContent        = m.tag;
  document.getElementById('leftIllustration').textContent = m.illustration;
  document.getElementById('leftDesc').textContent         = m.desc;

  switchTab('register');
  showCard('formStep');
  clearAllErrors();
  setGlobalErr('');
}

function goBack() {
  stopCountdown(); stopResend();
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('selectorScreen').classList.add('active');
}

function goToForm() {
  stopCountdown(); stopResend();
  showCard('formStep');
}

function showCard(id) {
  document.querySelectorAll('.auth-card').forEach(function(c){ c.classList.remove('active-card'); });
  document.getElementById(id).classList.add('active-card');
}

// ══════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.querySelectorAll('[id^="fields-"]').forEach(function(el){ el.classList.add('hidden'); });
  var t = document.getElementById('fields-' + currentPortal + '-' + tab);
  if (t) t.classList.remove('hidden');
  document.getElementById('nextBtnText').textContent = tab === 'register' ? 'Next →' : 'Login →';
  clearAllErrors();
  setGlobalErr('');
}

// ══════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════
function setErr(id, msg) {
  var e = document.getElementById('err-' + id); if (e) e.textContent = msg;
  var i = document.getElementById(id); if (i) i.classList.toggle('invalid', !!msg);
}
function clearAllErrors() {
  document.querySelectorAll('.err').forEach(function(e){ e.textContent=''; });
  document.querySelectorAll('input').forEach(function(i){ i.classList.remove('invalid'); });
}
function setGlobalErr(msg) {
  var e = document.getElementById('form-global-err');
  if (e) { e.textContent = msg; e.style.color = msg.startsWith('✅') ? '#4ade80' : '#f87171'; }
}
function isEmail(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function isPhone(v)  { return /^\d{7,15}$/.test(v.trim()); }

function validateForm() {
  clearAllErrors(); setGlobalErr('');
  var ok = true, p = currentPortal, t = currentTab;

  function req(id, label) {
    var el = document.getElementById(id); if (!el) return '';
    var v = el.value.trim();
    if (!v) { setErr(id, label + ' is required.'); ok = false; }
    return v;
  }

  if (p==='student' && t==='register') {
    req('s-fname','First name'); req('s-lname','Last name');
    var se = req('s-email','Email or username');
    if (se && se.includes('@') && !isEmail(se)) { setErr('s-email','Enter a valid email.'); ok=false; }
    var sp = req('s-password','Password');
    if (sp && sp.length<8) { setErr('s-password','Min 8 characters required.'); ok=false; }
  }
  if (p==='student' && t==='login') {
    req('sl-email','Email or username'); req('sl-password','Password');
  }
  if (p==='faculty' && t==='register') {
    req('f-fname','First name'); req('f-lname','Last name'); req('f-id','Faculty ID');
    var fe = req('f-email','Email');
    if (fe && !isEmail(fe)) { setErr('f-email','Enter a valid email.'); ok=false; }
    var fp = req('f-password','Password');
    if (fp && fp.length<8) { setErr('f-password','Min 8 characters required.'); ok=false; }
  }
  if (p==='faculty' && t==='login') {
    req('fl-email','Faculty ID or email'); req('fl-password','Password');
  }
  if (p==='parent' && t==='register') {
    req('p-fname','First name'); req('p-lname','Last name');
    var pm = req('p-mobile','Mobile number');
    if (pm && !isPhone(pm)) { setErr('p-mobile','Enter a valid mobile number.'); ok=false; }
  }
  if (p==='parent' && t==='login') {
    var plm = req('pl-mobile','Mobile number');
    if (plm && !isPhone(plm)) { setErr('pl-mobile','Enter a valid mobile number.'); ok=false; }
  }
  if (p==='enterprise' && t==='register') {
    req('e-fname','First name'); req('e-lname','Last name'); req('e-company','Company name');
    var ee = req('e-email','Email');
    if (ee && !isEmail(ee)) { setErr('e-email','Enter a valid email.'); ok=false; }
  }
  if (p==='enterprise' && t==='login') {
    var ele = req('el-email','Email');
    if (ele && !isEmail(ele)) { setErr('el-email','Enter a valid email.'); ok=false; }
  }
  return ok;
}

// ══════════════════════════════════════════
// COLLECT FORM DATA
// ══════════════════════════════════════════
function collectFormData() {
  var p=currentPortal, t=currentTab;
  function g(id){ var el=document.getElementById(id); return el?el.value.trim():''; }
  if (p==='student'    && t==='register') return {portal:p,action:t,firstName:g('s-fname'),lastName:g('s-lname'),emailOrUsername:g('s-email'),password:g('s-password')};
  if (p==='student'    && t==='login')    return {portal:p,action:t,emailOrUsername:g('sl-email'),password:g('sl-password')};
  if (p==='faculty'    && t==='register') return {portal:p,action:t,firstName:g('f-fname'),lastName:g('f-lname'),facultyId:g('f-id'),email:g('f-email'),password:g('f-password')};
  if (p==='faculty'    && t==='login')    return {portal:p,action:t,emailOrId:g('fl-email'),password:g('fl-password')};
  if (p==='parent'     && t==='register') return {portal:p,action:t,firstName:g('p-fname'),lastName:g('p-lname'),mobile:g('p-country')+g('p-mobile')};
  if (p==='parent'     && t==='login')    return {portal:p,action:t,mobile:g('pl-country')+g('pl-mobile')};
  if (p==='enterprise' && t==='register') return {portal:p,action:t,firstName:g('e-fname'),lastName:g('e-lname'),company:g('e-company'),email:g('e-email')};
  if (p==='enterprise' && t==='login')    return {portal:p,action:t,email:g('el-email')};
  return {};
}

function getMaskedTarget(data) {
  function maskEmail(e){ var p=e.split('@'); return p[0].slice(0,2)+'***@'+p[1]; }
  if (data.email)           return maskEmail(data.email);
  if (data.emailOrUsername) return data.emailOrUsername.includes('@') ? maskEmail(data.emailOrUsername) : data.emailOrUsername.slice(0,3)+'***';
  if (data.mobile)          return data.mobile.slice(0,-4).replace(/\d/g,'*')+data.mobile.slice(-4);
  return '****';
}

// ══════════════════════════════════════════
// FORM SUBMIT
// ══════════════════════════════════════════
function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  formDataCache  = collectFormData();
  otpChannel     = (currentPortal === 'parent') ? 'sms' : 'email';
  otpTarget      = getMaskedTarget(formDataCache);
  resendAttempts = 0;

  setLoading(true);

  // Skip OTP for both login and register — go directly to success
  setTimeout(function() {
    setLoading(false);
    showSuccess();
  }, 600);
  return;

  // Real backend call
  fetch(BACKEND_URL + '/api/otp/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(formDataCache)
  })
  .then(function(res){ return res.json().then(function(j){ return {ok:res.ok,j:j}; }); })
  .then(function(r){
    setLoading(false);
    if (!r.ok) { setGlobalErr(r.j.message || 'Failed to send OTP.'); return; }
    if (r.j.maskedTarget) otpTarget  = r.j.maskedTarget;
    if (r.j.channel)      otpChannel = r.j.channel;
    setupOTPScreen();
    showCard('otpStep');
  })
  .catch(function(){
    setLoading(false);
    setGlobalErr('Cannot connect to server. Please try again.');
  });
}

function setLoading(on) {
  var btn = document.getElementById('nextBtn');
  document.getElementById('nextBtnText').classList.toggle('hidden', on);
  document.getElementById('nextBtnSpinner').classList.toggle('hidden', !on);
  btn.disabled = on;
}

// ══════════════════════════════════════════
// OTP SCREEN SETUP
// ══════════════════════════════════════════
function setupOTPScreen() {
  document.getElementById('otpChannelLabel').textContent = otpChannel==='sms' ? 'Mobile' : 'Email';
  document.getElementById('otpTarget').textContent       = otpTarget;
  document.getElementById('err-otp').textContent         = '';
  document.getElementById('err-otp').style.color         = '#f87171';
  document.getElementById('verifyBtn').disabled          = false;

  document.querySelectorAll('.otp-box').forEach(function(b){ b.value=''; b.classList.remove('filled'); });
  startCountdown(OTP_DURATION);
  startResendCooldown();
  setupOTPBoxes();
}

function setupOTPBoxes() {
  var boxes = document.querySelectorAll('.otp-box');
  boxes.forEach(function(box, i) {
    box.oninput = function() {
      box.value = box.value.replace(/\D/g,'').slice(-1);
      box.classList.toggle('filled', !!box.value);
      if (box.value && i < boxes.length-1) boxes[i+1].focus();
    };
    box.onkeydown = function(ev) {
      if (ev.key==='Backspace' && !box.value && i>0) boxes[i-1].focus();
    };
    box.onpaste = function(ev) {
      ev.preventDefault();
      var txt = (ev.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
      txt.split('').slice(0,6).forEach(function(ch,j){ if(boxes[j]){boxes[j].value=ch;boxes[j].classList.add('filled');} });
      boxes[Math.min(txt.length,5)].focus();
    };
  });
  boxes[0].focus();
}

function getOTPValue() {
  return Array.from(document.querySelectorAll('.otp-box')).map(function(b){return b.value;}).join('');
}

// ══════════════════════════════════════════
// COUNTDOWN
// ══════════════════════════════════════════
function startCountdown(secs) {
  stopCountdown();
  var rem = secs;
  var el  = document.getElementById('countdown');
  el.classList.remove('expired');

  function tick() {
    var m = String(Math.floor(rem/60)).padStart(2,'0');
    var s = String(rem%60).padStart(2,'0');
    el.textContent = m+':'+s;
    if (rem <= 0) {
      stopCountdown();
      el.textContent = 'Expired';
      el.classList.add('expired');
      document.getElementById('err-otp').textContent = 'OTP expired. Please request a new one.';
      document.getElementById('verifyBtn').disabled  = true;
    }
    rem--;
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

function stopCountdown() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval=null; }
}

function startResendCooldown() {
  stopResend();
  var btn  = document.getElementById('resendBtn');
  var secs = RESEND_COOLDOWN;
  btn.disabled = true;
  btn.textContent = 'Resend OTP (' + secs + 's)';

  resendInterval = setInterval(function() {
    secs--;
    btn.textContent = 'Resend OTP (' + secs + 's)';
    if (secs <= 0) {
      stopResend();
      btn.textContent = 'Resend OTP';
      btn.disabled = (resendAttempts >= MAX_RESEND);
    }
  }, 1000);
}

function stopResend() {
  if (resendInterval) { clearInterval(resendInterval); resendInterval=null; }
}

// ══════════════════════════════════════════
// VERIFY OTP
// ══════════════════════════════════════════
function verifyOTP() {
  var otp   = getOTPValue();
  var errEl = document.getElementById('err-otp');
  errEl.style.color   = '#f87171';
  errEl.textContent   = '';

  if (otp.length < 6) { errEl.textContent = 'Please enter the complete 6-digit OTP.'; return; }

  var btn = document.getElementById('verifyBtn');
  document.getElementById('verifyBtnText').classList.add('hidden');
  document.getElementById('verifyBtnSpinner').classList.remove('hidden');
  btn.disabled = true;

  if (DEMO_MODE) {
    setTimeout(function() {
      document.getElementById('verifyBtnText').classList.remove('hidden');
      document.getElementById('verifyBtnSpinner').classList.add('hidden');
      btn.disabled = false;
      if (otp === demoOTP) {
        stopCountdown();
        showSuccess();
      } else {
        errEl.textContent = 'Invalid OTP. Please try again.';
        shakeBoxes();
      }
    }, 700);
    return;
  }

  // Real backend verify
  fetch(BACKEND_URL + '/api/otp/verify', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(Object.assign({}, formDataCache, {otp:otp}))
  })
  .then(function(res){ return res.json().then(function(j){ return {ok:res.ok,j:j}; }); })
  .then(function(r) {
    document.getElementById('verifyBtnText').classList.remove('hidden');
    document.getElementById('verifyBtnSpinner').classList.add('hidden');
    btn.disabled = false;
    if (!r.ok) { errEl.textContent = r.j.message||'Invalid OTP.'; shakeBoxes(); return; }
    if (r.j.token) { sessionStorage.setItem('authToken',r.j.token); sessionStorage.setItem('portal',currentPortal); }
    stopCountdown();
    showSuccess();
  })
  .catch(function() {
    document.getElementById('verifyBtnText').classList.remove('hidden');
    document.getElementById('verifyBtnSpinner').classList.add('hidden');
    btn.disabled = false;
    errEl.textContent = 'Cannot connect to server.';
  });
}

function shakeBoxes() {
  var el = document.getElementById('otpBoxes');
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
}

// ══════════════════════════════════════════
// RESEND OTP
// ══════════════════════════════════════════
function resendOTP() {
  if (resendAttempts >= MAX_RESEND) {
    document.getElementById('err-otp').textContent = 'Max resend attempts reached. Try again later.';
    return;
  }
  resendAttempts++;
  document.getElementById('err-otp').textContent = '';

  if (DEMO_MODE) {
    demoOTP = String(Math.floor(100000 + Math.random() * 900000));
    document.querySelectorAll('.otp-box').forEach(function(b){ b.value=''; b.classList.remove('filled'); });
    document.querySelectorAll('.otp-box')[0].focus();
    startCountdown(OTP_DURATION);
    startResendCooldown();
    document.getElementById('err-otp').style.color   = '#f97316';
    document.getElementById('err-otp').textContent   = '🔧 New Demo OTP: ' + demoOTP;
    return;
  }

  fetch(BACKEND_URL + '/api/otp/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(Object.assign({}, formDataCache, {resend:true}))
  })
  .then(function(res){ return res.json().then(function(j){ return {ok:res.ok,j:j}; }); })
  .then(function(r) {
    if (!r.ok) { document.getElementById('err-otp').textContent = r.j.message||'Failed to resend.'; return; }
    document.querySelectorAll('.otp-box').forEach(function(b){ b.value=''; b.classList.remove('filled'); });
    document.querySelectorAll('.otp-box')[0].focus();
    startCountdown(OTP_DURATION);
    startResendCooldown();
  })
  .catch(function(){ document.getElementById('err-otp').textContent = 'Cannot connect to server.'; });
}

// ══════════════════════════════════════════
// SUCCESS + REDIRECT
// ══════════════════════════════════════════
function showSuccess() {
  var labels = {student:'Student',faculty:'Faculty',parent:'Parent',enterprise:'Enterprise'};
  var action  = formDataCache.action === 'login' ? 'Logging you in' : 'Registering';
  document.getElementById('successMsg').textContent = action + '... Redirecting to ' + labels[currentPortal] + ' Portal';

  // ── Save user name & portal to sessionStorage ──
  var d = formDataCache;
  var name = '';
  if (d.firstName) name = d.firstName + (d.lastName ? ' ' + d.lastName : '');
  else if (d.emailOrUsername) name = d.emailOrUsername.split('@')[0];
  else if (d.emailOrId)       name = d.emailOrId.split('@')[0];
  else if (d.mobile)          name = 'User';
  else if (d.email)           name = d.email.split('@')[0];
  sessionStorage.setItem('portalUser',  name.trim());
  sessionStorage.setItem('portalType',  currentPortal);
  sessionStorage.setItem('portalLogin', 'true');

  showCard('successStep');
  requestAnimationFrame(function(){ document.getElementById('progressFill').style.width='100%'; });
  setTimeout(function(){ window.location.href = 'showcase/index.html'; }, 2000);
}

// ══════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════
function togglePw(id, btn) {
  var inp = document.getElementById(id); if (!inp) return;
  var show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁';
}

// Shake animation
var ss = document.createElement('style');
ss.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}';
document.head.appendChild(ss);

// Auto-open from URL hash
(function(){
  var h = window.location.hash.replace('#','');
  if (['student','faculty','parent','enterprise'].indexOf(h) !== -1) openAuth(h);
})();
