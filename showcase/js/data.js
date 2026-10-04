/* ═══════════════════════════════════════════════════
   PORTAL DATA STORE – Simulates backend responses
   In production, replace fetch() calls to real API
═══════════════════════════════════════════════════ */

const DB = {
  stats: {
    totalStudents: 0,
    totalAchievements: 0,
    studentsWithAchievements: 0,
    verifiedAchievements: 0,
    hackathons: 0,
    research: 0,
    patents: 0,
    awards: 0
  },

  categories: [
    { id: 'hackathon',      label: 'Hackathon',          group: 'Innovation',   icon: '💻', color: '#f97316', count: 0 },
    { id: 'ideathon',       label: 'Ideathon',           group: 'Innovation',   icon: '💡', color: '#fb923c', count: 0 },
    { id: 'startup',        label: 'Startup',            group: 'Innovation',   icon: '🚀', color: '#f59e0b', count: 0 },
    { id: 'project',        label: 'Project',            group: 'Innovation',   icon: '🔧', color: '#eab308', count: 0 },
    { id: 'research',       label: 'Research Paper',     group: 'Research',     icon: '📄', color: '#22c55e', count: 0 },
    { id: 'journal',        label: 'Journal',            group: 'Research',     icon: '📰', color: '#16a34a', count: 0 },
    { id: 'article',        label: 'Article',            group: 'Research',     icon: '✍️', color: '#15803d', count: 0 },
    { id: 'patent',         label: 'Patent',             group: 'Research',     icon: '🏛️', color: '#166534', count: 0 },
    { id: 'coding',         label: 'Coding Competition', group: 'Technical',    icon: '⌨️', color: '#3b82f6', count: 0 },
    { id: 'technical',      label: 'Technical Comp.',    group: 'Technical',    icon: '⚙️', color: '#2563eb', count: 0 },
    { id: 'paper_pres',     label: 'Paper Presentation', group: 'Technical',    icon: '🎤', color: '#1d4ed8', count: 0 },
    { id: 'internship',     label: 'Internship',         group: 'Professional', icon: '💼', color: '#8b5cf6', count: 0 },
    { id: 'certification',  label: 'Certification',      group: 'Professional', icon: '🎓', color: '#7c3aed', count: 0 },
    { id: 'workshop',       label: 'Workshop',           group: 'Professional', icon: '🛠️', color: '#6d28d9', count: 0 },
    { id: 'award',          label: 'Award',              group: 'Recognition',  icon: '🏆', color: '#ec4899', count: 0 },
    { id: 'prize',          label: 'Prize',              group: 'Recognition',  icon: '🥇', color: '#db2777', count: 0 },
    { id: 'other',          label: 'Other',              group: 'Recognition',  icon: '⭐', color: '#be185d', count: 0 },
  ],

  yearStats: [
    { year: '2022–23', total: 0, students: 0, hackathon: 0, research: 0, patent: 0, cert: 0, award: 0 },
    { year: '2023–24', total: 0, students: 0, hackathon: 0, research: 0, patent: 0, cert: 0, award: 0 },
    { year: '2024–25', total: 0, students: 0, hackathon: 0, research: 0, patent: 0, cert: 0, award: 0 },
    { year: '2025–26', total: 0, students: 0, hackathon: 0, research: 0, patent: 0, cert: 0, award: 0 },
  ],

  batches: [
    { batch: '2022–2026', students: 60, withAch: 0, achievements: 0 },
    { batch: '2023–2027', students: 60, withAch: 0, achievements: 0 },
    { batch: '2024–2028', students: 60, withAch: 0, achievements: 0 },
    { batch: '2025–2029', students: 60, withAch: 0, achievements: 0 },
  ],

  achievements: [],

  staff: [
    { id: 1, name: 'Dr. Meenakshi R', role: 'admin',    email: 'admin@acew.edu',   passwordHash: 'hashed' },
    { id: 2, name: 'Prof. Suresh K',  role: 'staff',    email: 'staff@acew.edu',   passwordHash: 'hashed' },
  ]
};

// ── AUTH STATE ────────────────────────────
const Auth = {
  currentUser: null,
  role: 'public', // 'public' | 'student' | 'staff' | 'admin'

  login(email, password) {
    // Simulate backend auth check
    const STAFF_CREDS = { 'admin@acew.edu': 'Admin@123', 'staff@acew.edu': 'Staff@123' };
    if (STAFF_CREDS[email] && STAFF_CREDS[email] === password) {
      this.role = email === 'admin@acew.edu' ? 'admin' : 'staff';
      this.currentUser = DB.staff.find(s => s.email === email);
      sessionStorage.setItem('portalRole', this.role);
      sessionStorage.setItem('portalUser', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  },

  logout() {
    this.role = 'public';
    this.currentUser = null;
    sessionStorage.removeItem('portalRole');
    sessionStorage.removeItem('portalUser');
  },

  restore() {
    const r = sessionStorage.getItem('portalRole');
    const u = sessionStorage.getItem('portalUser');
    if (r && u) {
      this.role = r;
      try { this.currentUser = JSON.parse(u); } catch(e) { this.currentUser = { name: u }; }
    }
  },

  isStaff() { return this.role === 'staff' || this.role === 'admin'; },
  isAdmin()  { return this.role === 'admin'; }
};

Auth.restore();

// ── RECOMPUTE ALL COUNTS FROM achievements[] ─────────
DB.recompute = function() {
  var achs = DB.achievements;

  // category counts
  DB.categories.forEach(function(c) {
    c.count = achs.filter(function(a) { return a.category === c.id; }).length;
  });

  // yearStats
  DB.yearStats.forEach(function(y) {
    var ya = achs.filter(function(a) { return a.year === y.year; });
    y.total    = ya.length;
    y.students = new Set(ya.map(function(a) { return a.student; })).size;
    y.hackathon = ya.filter(function(a) { return a.category === 'hackathon'; }).length;
    y.research  = ya.filter(function(a) { return a.category === 'research' || a.category === 'journal'; }).length;
    y.patent    = ya.filter(function(a) { return a.category === 'patent'; }).length;
    y.cert      = ya.filter(function(a) { return a.category === 'certification'; }).length;
    y.award     = ya.filter(function(a) { return a.category === 'award' || a.category === 'prize'; }).length;
  });

  // batches
  DB.batches.forEach(function(b) {
    var ba = achs.filter(function(a) { return a.batch === b.batch; });
    b.achievements = ba.length;
    b.withAch      = new Set(ba.map(function(a) { return a.student; })).size;
  });

  // stats
  DB.stats.totalAchievements        = achs.length;
  DB.stats.verifiedAchievements     = achs.filter(function(a) { return a.verified; }).length;
  DB.stats.studentsWithAchievements = new Set(achs.map(function(a) { return a.student; })).size;
  DB.stats.hackathons = DB.categories.find(function(c) { return c.id === 'hackathon'; }).count;
  DB.stats.research   = DB.categories.find(function(c) { return c.id === 'research'; }).count;
  DB.stats.patents    = DB.categories.find(function(c) { return c.id === 'patent'; }).count;
  DB.stats.awards     = DB.categories.find(function(c) { return c.id === 'award'; }).count;
};

DB.recompute();

// ══════════════════════════════════════════
// PERFORMANCE SCORING ENGINE
// ══════════════════════════════════════════
var SCORING = {
  // Category weights (max marks per category)
  weights: {
    hackathon: 20, competition: 20, coding: 20, technical: 20, ideathon: 20,
    project: 15, startup: 15,
    research: 15, journal: 15, patent: 15, article: 5, paper_pres: 5,
    certification: 10, internship: 5, workshop: 5,
    award: 10, prize: 10, other: 5
  },

  // Position → raw score
  positionScore: function(pos) {
    if (!pos || pos === '—') return 5;
    var p = pos.toLowerCase();
    if (p.includes('winner') || p.includes('1st') || p.includes('first'))  return 20;
    if (p.includes('runner') || p.includes('2nd') || p.includes('second')) return 18;
    if (p.includes('finalist') || p.includes('3rd') || p.includes('third')) return 15;
    if (p.includes('top 10') || p.includes('top10'))  return 12;
    if (p.includes('top 20') || p.includes('top20'))  return 10;
    if (p.includes('participation') || p.includes('participated')) return 5;
    return 8;
  },

  // Project level score
  projectScore: function(a) {
    var ev = (a.event || '').toLowerCase();
    if (ev.includes('national') || ev.includes('sih') || ev.includes('india')) return 15;
    if (ev.includes('state') || ev.includes('zonal')) return 12;
    if (ev.includes('college') || ev.includes('intra') || ev.includes('dept')) return 8;
    return 5;
  },

  // Research score
  researchScore: function(cat) {
    if (cat === 'patent')     return 15;
    if (cat === 'journal')    return 12;
    if (cat === 'research')   return 10;
    if (cat === 'paper_pres' || cat === 'article') return 6;
    return 5;
  },

  // Certification score
  certScore: function(a) {
    var t = (a.title + ' ' + (a.event || '')).toLowerCase();
    if (t.includes('aws') || t.includes('google') || t.includes('microsoft') ||
        t.includes('cisco') || t.includes('oracle') || t.includes('advanced')) return 10;
    if (t.includes('professional') || t.includes('nptel') || t.includes('coursera') ||
        t.includes('udemy') || t.includes('linkedin')) return 8;
    return 5;
  },

  // Rating → marks (0–10)
  ratingScore: function(rating) {
    if (!rating) return 0;
    var r = parseFloat(rating);
    if (r >= 5.0)  return 10;
    if (r >= 4.5)  return 9;
    if (r >= 4.0)  return 8;
    if (r >= 3.5)  return 7;
    if (r >= 3.0)  return 6;
    return 5;
  },

  // Score a single achievement (returns 0–20)
  scoreAchievement: function(a) {
    var cat = a.category;
    var score = 0;
    if (['hackathon','coding','technical','ideathon','competition'].includes(cat)) {
      score = this.positionScore(a.position);
    } else if (['project','startup'].includes(cat)) {
      score = this.projectScore(a);
    } else if (['research','journal','patent','paper_pres','article'].includes(cat)) {
      score = this.researchScore(cat);
    } else if (['certification','workshop','internship'].includes(cat)) {
      score = this.certScore(a);
    } else if (['award','prize'].includes(cat)) {
      score = this.positionScore(a.position);
    } else {
      score = 5;
    }
    return score;
  },

  // Compute full 100-point score for a student
  computeStudentScore: function(achs) {
    var verified = achs.filter(function(a) { return a.verified; });
    if (!verified.length) return { total: 0, breakdown: {}, achCount: 0, verifiedCount: 0 };

    var breakdown = {
      hackathon: 0, project: 0, research: 0,
      patent: 0, certification: 0, presentation: 0,
      leadership: 0, rating: 0, consistency: 0
    };

    var yearsActive = new Set();

    verified.forEach(function(a) {
      var cat = a.category;
      var s = SCORING.scoreAchievement(a);

      if (['hackathon','coding','technical','ideathon'].includes(cat)) {
        breakdown.hackathon = Math.max(breakdown.hackathon, s);
      } else if (['project','startup'].includes(cat)) {
        breakdown.project = Math.max(breakdown.project, s);
      } else if (['research','journal'].includes(cat)) {
        breakdown.research = Math.max(breakdown.research, s);
      } else if (cat === 'patent') {
        breakdown.patent = Math.max(breakdown.patent, s);
      } else if (['certification','workshop','internship'].includes(cat)) {
        breakdown.certification = Math.max(breakdown.certification, s);
      } else if (['paper_pres','article'].includes(cat)) {
        breakdown.presentation = Math.max(breakdown.presentation, s);
      } else if (['award','prize'].includes(cat)) {
        breakdown.rating = Math.max(breakdown.rating, SCORING.ratingScore(4.5));
      }

      if (a.year) yearsActive.add(a.year);
    });

    // Leadership: bonus for team contributions
    var teamAchs = verified.filter(function(a) { return a.team; });
    breakdown.leadership = Math.min(5, teamAchs.length * 2);

    // Rating score: based on achievement count as proxy
    if (!breakdown.rating) {
      var ratingProxy = Math.min(verified.length / 3, 1);
      breakdown.rating = Math.round(ratingProxy * 8);
    }

    // Consistency: years active
    breakdown.consistency = Math.min(5, yearsActive.size * 2);

    // Cap each category
    breakdown.hackathon    = Math.min(20, breakdown.hackathon);
    breakdown.project      = Math.min(15, breakdown.project);
    breakdown.research     = Math.min(15, breakdown.research);
    breakdown.patent       = Math.min(15, breakdown.patent);
    breakdown.certification= Math.min(10, breakdown.certification);
    breakdown.presentation = Math.min(5,  breakdown.presentation);
    breakdown.leadership   = Math.min(5,  breakdown.leadership);
    breakdown.rating       = Math.min(10, breakdown.rating);
    breakdown.consistency  = Math.min(5,  breakdown.consistency);

    var total = Object.values(breakdown).reduce(function(s, v) { return s + v; }, 0);
    total = Math.min(100, total);

    return {
      total: total,
      breakdown: breakdown,
      achCount: achs.length,
      verifiedCount: verified.length
    };
  }
};

// Build ranked leaderboard from DB.achievements
function buildRankings() {
  var map = {};
  DB.achievements.forEach(function(a) {
    if (!map[a.student]) map[a.student] = { student: a.student, batch: a.batch, achs: [] };
    map[a.student].achs.push(a);
  });

  var list = Object.values(map).map(function(s) {
    var sc = SCORING.computeStudentScore(s.achs);
    return {
      student: s.student, batch: s.batch,
      score: sc.total, breakdown: sc.breakdown,
      achCount: sc.achCount, verifiedCount: sc.verifiedCount,
      achs: s.achs
    };
  });

  list.sort(function(a, b) { return b.score - a.score || b.verifiedCount - a.verifiedCount; });

  list.forEach(function(s, i) {
    s.rank = i + 1;
    s.tier = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze'
           : i < 10 ? 'top10' : i < 20 ? 'top20' : 'top50';
  });

  return list;
}

// Special recognition badges
function getSpecialBadges(ranked) {
  if (!ranked.length) return [];
  var badges = [];
  var verified = DB.achievements.filter(function(a) { return a.verified; });

  // Performance of the Year – highest score
  if (ranked[0]) badges.push({ icon: '🏆', label: 'Performance of the Year', student: ranked[0].student, score: ranked[0].score });

  // Top Rated – most verified achievements
  var topRated = ranked.slice().sort(function(a,b){ return b.verifiedCount - a.verifiedCount; })[0];
  if (topRated) badges.push({ icon: '⭐', label: 'Top Rated Achievement', student: topRated.student, score: topRated.verifiedCount + ' verified' });

  // Most Innovative – most project/startup/ideathon
  var innovMap = {};
  verified.filter(function(a){ return ['project','startup','ideathon'].includes(a.category); })
    .forEach(function(a){ innovMap[a.student] = (innovMap[a.student]||0)+1; });
  var innovTop = Object.entries(innovMap).sort(function(a,b){return b[1]-a[1];})[0];
  if (innovTop) badges.push({ icon: '🚀', label: 'Most Innovative Student', student: innovTop[0], score: innovTop[1] + ' innovations' });

  // Research Star – most research/journal/patent
  var resMap = {};
  verified.filter(function(a){ return ['research','journal','patent','article','paper_pres'].includes(a.category); })
    .forEach(function(a){ resMap[a.student] = (resMap[a.student]||0)+1; });
  var resTop = Object.entries(resMap).sort(function(a,b){return b[1]-a[1];})[0];
  if (resTop) badges.push({ icon: '🔬', label: 'Research Star', student: resTop[0], score: resTop[1] + ' publications' });

  // Innovation Leader – highest hackathon breakdown
  var hackTop = ranked.slice().sort(function(a,b){ return (b.breakdown.hackathon||0)-(a.breakdown.hackathon||0); })[0];
  if (hackTop && hackTop.breakdown.hackathon > 0) badges.push({ icon: '💡', label: 'Innovation Leader', student: hackTop.student, score: hackTop.breakdown.hackathon + '/20 pts' });

  // Top 10 Performer
  if (ranked[9]) badges.push({ icon: '🥇', label: 'Top 10 Performer', student: ranked[9].student, score: ranked[9].score + ' pts' });

  // Top 20 Achiever
  if (ranked[19]) badges.push({ icon: '🌟', label: 'Top 20 Achiever', student: ranked[19].student, score: ranked[19].score + ' pts' });

  return badges;
}

// ── HELPERS ───────────────────────────────
function calcAchievementRate(withAch, total) {
  return total ? ((withAch / total) * 100).toFixed(1) : 0;
}

function getCategoryPercent(catId) {
  const cat = DB.categories.find(c => c.id === catId);
  if (!cat || !DB.stats.totalAchievements) return 0;
  return ((cat.count / DB.stats.totalAchievements) * 100).toFixed(1);
}

function animateCount(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = Math.round(target).toLocaleString(); clearInterval(timer); }
    else el.textContent = Math.round(start).toLocaleString();
  }, 16);
}

// ══════════════════════════════════════════
// COLLEGE HIGHLIGHTS STATIC DATA
// ══════════════════════════════════════════
var HIGHLIGHTS = {

  faculty: [
    { name:'Dr. Meenakshi R',   role:'Head of Department',    dept:'CSE', qual:'Ph.D – Computer Science',        exp:'15 yrs' },
    { name:'Prof. Suresh K',    role:'Associate Professor',   dept:'CSE', qual:'M.E. – Software Engineering',    exp:'10 yrs' },
    { name:'Dr. Priya S',       role:'Assistant Professor',   dept:'CSE', qual:'Ph.D – Artificial Intelligence', exp:'8 yrs'  },
    { name:'Prof. Ramya V',     role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Network Engineering',     exp:'7 yrs'  },
    { name:'Dr. Kavitha M',     role:'Associate Professor',   dept:'CSE', qual:'Ph.D – Data Science',            exp:'12 yrs' },
    { name:'Prof. Anitha R',    role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Cyber Security',          exp:'5 yrs'  },
    { name:'Dr. Selvi P',       role:'Assistant Professor',   dept:'CSE', qual:'Ph.D – Machine Learning',        exp:'9 yrs'  },
    { name:'Prof. Deepa K',     role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Cloud Computing',         exp:'6 yrs'  },
    { name:'Prof. Nithya S',    role:'Assistant Professor',   dept:'CSE', qual:'M.E. – IoT',                     exp:'4 yrs'  },
    { name:'Dr. Bharathi V',    role:'Associate Professor',   dept:'CSE', qual:'Ph.D – Blockchain',              exp:'11 yrs' },
    { name:'Prof. Lavanya M',   role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Full Stack Dev',          exp:'5 yrs'  },
    { name:'Prof. Saranya R',   role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Database Systems',        exp:'6 yrs'  },
    { name:'Dr. Vijaya K',      role:'Associate Professor',   dept:'CSE', qual:'Ph.D – Computer Vision',         exp:'13 yrs' },
    { name:'Prof. Geetha N',    role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Embedded Systems',        exp:'7 yrs'  },
    { name:'Prof. Revathi S',   role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Software Testing',        exp:'5 yrs'  },
    { name:'Dr. Malathi P',     role:'Associate Professor',   dept:'CSE', qual:'Ph.D – NLP',                     exp:'10 yrs' },
    { name:'Prof. Sindhu V',    role:'Assistant Professor',   dept:'CSE', qual:'M.E. – Web Technologies',        exp:'4 yrs'  },
    { name:'Prof. Kalpana R',   role:'Lab Instructor',        dept:'CSE', qual:'B.E. – CSE',                     exp:'8 yrs'  },
  ],

  labs: [
    { name:'Programming Lab',       systems:'60 Systems',          desc:'Core programming lab with latest IDEs, compilers and development tools for all languages.',      icon:'💻' },
    { name:'Networking Lab',        systems:'40 Systems',          desc:'Equipped with Cisco routers, switches and packet tracer for hands-on networking experiments.',    icon:'🌐' },
    { name:'AI & ML Lab',           systems:'GPU Workstations',    desc:'High-performance GPU workstations for deep learning, computer vision and AI model training.',     icon:'🧠' },
    { name:'Cyber Security Lab',    systems:'Dedicated Servers',   desc:'Isolated environment for ethical hacking, penetration testing and security research.',           icon:'🛡️' },
    { name:'IoT Lab',               systems:'Arduino / RPi Kits',  desc:'Raspberry Pi, Arduino and sensor kits for building smart IoT prototypes and embedded systems.',   icon:'📡' },
    { name:'Project Lab',           systems:'24/7 Access',         desc:'Open-access lab for final year and research projects with high-speed internet and workstations.',  icon:'🔬' },
    { name:'Digital Library',       systems:'10,000+ e-Books',     desc:'Online access to IEEE, Springer, Elsevier journals and 10,000+ e-books and research papers.',     icon:'📚' },
    { name:'Smart Classrooms',      systems:'Interactive Boards',  desc:'All classrooms equipped with smart boards, projectors and audio-visual learning systems.',        icon:'🖥️' },
  ],

  industryPartners: [
    { name:'Infosys',         type:'MoU Partner',      domain:'Software Development',   detail:'Campus recruitment, internships and training programs for final year students.' },
    { name:'TCS',             type:'Placement Partner', domain:'IT Services',            detail:'Annual campus drives, skill development workshops and live project exposure.' },
    { name:'Wipro',           type:'MoU Partner',      domain:'IT Consulting',          detail:'Wipro WILP program, internships and placement drives for CSE students.' },
    { name:'HCL Technologies',type:'Placement Partner', domain:'Technology Solutions',   detail:'Recruitment partner with dedicated placement drives and pre-placement offers.' },
    { name:'Cognizant',       type:'MoU Partner',      domain:'Digital Engineering',    detail:'CTS campus connect program, hackathons and technical training sessions.' },
    { name:'Amazon AWS',      type:'Cloud Partner',    domain:'Cloud Computing',        detail:'AWS Academy program providing cloud certifications and hands-on lab access.' },
    { name:'Microsoft',       type:'Tech Partner',     domain:'Software & Cloud',       detail:'Microsoft Learn program, Azure credits and certification support for students.' },
    { name:'Google',          type:'Tech Partner',     domain:'AI & Cloud',             detail:'Google Developer Student Club, cloud credits and AI/ML training resources.' },
    { name:'IBM',             type:'MoU Partner',      domain:'AI & Analytics',         detail:'IBM SkillsBuild program, AI certifications and enterprise project exposure.' },
    { name:'ZOHO',            type:'Placement Partner', domain:'SaaS Products',          detail:'ZOHO campus recruitment with strong focus on product development skills.' },
    { name:'Freshworks',      type:'Placement Partner', domain:'CRM & SaaS',             detail:'Freshworks campus connect with internship-to-hire programs.' },
    { name:'Accenture',       type:'Placement Partner', domain:'Consulting & Tech',      detail:'Annual placement drives and Accenture Innovation Challenge participation.' },
    { name:'Capgemini',       type:'Placement Partner', domain:'IT Services',            detail:'Capgemini campus recruitment and digital skills training programs.' },
    { name:'NASSCOM',         type:'Industry Body',    domain:'IT Industry',            detail:'NASSCOM FutureSkills program and industry readiness certification support.' },
    { name:'NPTEL',           type:'Academic Partner', domain:'Online Education',       detail:'NPTEL course integration, certification support and faculty development.' },
    { name:'Cisco',           type:'Tech Partner',     domain:'Networking',             detail:'Cisco Networking Academy providing CCNA certifications and lab equipment.' },
    { name:'Oracle',          type:'Tech Partner',     domain:'Database & Cloud',       detail:'Oracle Academy program with database certifications and cloud training.' },
    { name:'ISRO',            type:'Research Partner', domain:'Space Technology',       detail:'Research collaboration and student project opportunities in space tech.' },
    { name:'DRDO',            type:'Research Partner', domain:'Defence Research',       detail:'Research internships and project collaboration for advanced CSE students.' },
    { name:'TATA Consultancy', type:'Placement Partner','domain':'IT Services',         detail:'TCS NQT campus drives and TCS iON digital assessment partnerships.' },
    { name:'Sutherland',      type:'Placement Partner', domain:'BPO & Tech',            detail:'Campus recruitment for technical support and software development roles.' },
    { name:'Mphasis',         type:'Placement Partner', domain:'IT Services',           detail:'Mphasis campus connect with focus on banking and financial technology.' },
    { name:'Hexaware',        type:'Placement Partner', domain:'IT & BPO',              detail:'Hexaware campus drives with digital transformation project exposure.' },
    { name:'Mindtree',        type:'Placement Partner', domain:'IT Services',           detail:'Mindtree campus recruitment and digital skills development programs.' },
    { name:'L&T Infotech',    type:'Placement Partner', domain:'Engineering & IT',      detail:'LTI campus drives with engineering and technology project opportunities.' },
  ],

  studentBatches: [
    { batch:'2022–2026', year:'1st Year (2025–26)', students:60, dept:'CSE' },
    { batch:'2023–2027', year:'2nd Year (2025–26)', students:60, dept:'CSE' },
    { batch:'2024–2028', year:'3rd Year (2025–26)', students:60, dept:'CSE' },
    { batch:'2025–2029', year:'4th Year (2025–26)', students:60, dept:'CSE' },
  ]
};

// Compute total students from batches
HIGHLIGHTS.totalStudents = HIGHLIGHTS.studentBatches.reduce(function(s,b){ return s+b.students; }, 0);
HIGHLIGHTS.totalFaculty  = HIGHLIGHTS.faculty.length;
HIGHLIGHTS.totalLabs     = HIGHLIGHTS.labs.length;
HIGHLIGHTS.totalPartners = HIGHLIGHTS.industryPartners.length;
