/* ═══════════════════════════════════════════════
   AI PROJECT ASSISTANT – ai-assistant.js
   Natural language project search & detail view
═══════════════════════════════════════════════ */

// ── BUILT-IN PROJECT KNOWLEDGE BASE ──────────
// Extends DB.achievements with rich project metadata.
// Keys match achievement titles (lowercase) or IDs.
const PROJECT_KB = [
  {
    title: "Smart Attendance System using Face Recognition",
    category: "project", domain: "Artificial Intelligence",
    technologies: ["Python", "OpenCV", "DeepFace", "Flask", "SQLite"],
    department: "CSE", team: "Team Alpha", year: "2024–25",
    problem: "Manual attendance is time-consuming and prone to proxy.",
    solution: "Automated face recognition system that marks attendance in real-time using a webcam.",
    features: ["Real-time face detection", "Multi-face support", "Auto report generation", "Admin dashboard"],
    innovation: "Uses DeepFace for 98%+ accuracy even with masks.",
    status: "Completed",
    skills: ["Computer Vision", "Python", "Machine Learning"],
    events: ["Smart India Hackathon 2024"],
    github: "https://github.com/example/smart-attendance"
  },
  {
    title: "IoT-Based Smart Agriculture Monitoring",
    category: "project", domain: "Internet of Things",
    technologies: ["Arduino", "NodeMCU", "MQTT", "React", "Firebase"],
    department: "CSE", team: "AgriTech Team", year: "2024–25",
    problem: "Farmers lack real-time data on soil moisture, temperature, and crop health.",
    solution: "IoT sensor network that monitors farm conditions and sends alerts via mobile app.",
    features: ["Soil moisture sensing", "Weather alerts", "Automated irrigation", "Mobile dashboard"],
    innovation: "Solar-powered nodes with 30-day battery backup.",
    status: "Completed",
    skills: ["IoT", "Embedded Systems", "React Native"],
    events: ["IEEE Hackathon 2024"],
    github: ""
  },
  {
    title: "Cybersecurity Threat Detection using ML",
    category: "project", domain: "Cybersecurity",
    technologies: ["Python", "Scikit-learn", "Wireshark", "Pandas", "Flask"],
    department: "CSE", team: "SecureNet", year: "2023–24",
    problem: "Traditional firewalls fail to detect zero-day attacks and anomalous network behavior.",
    solution: "ML model trained on network traffic data to classify and flag threats in real-time.",
    features: ["Anomaly detection", "Real-time alerts", "Traffic visualization", "Threat logs"],
    innovation: "Achieves 96% detection rate with under 0.5% false positives.",
    status: "Completed",
    skills: ["Machine Learning", "Network Security", "Python"],
    events: ["CyberSec Hackathon 2023"],
    github: "https://github.com/example/threat-detection"
  },
  {
    title: "Healthcare Patient Management System",
    category: "project", domain: "Healthcare",
    technologies: ["React", "Node.js", "MongoDB", "Express", "JWT"],
    department: "CSE", team: "HealthTech", year: "2024–25",
    problem: "Hospitals struggle with paper-based records, leading to errors and delays.",
    solution: "Full-stack web app for managing patient records, appointments, and prescriptions.",
    features: ["Patient registration", "Appointment scheduling", "Prescription management", "Analytics"],
    innovation: "AI-powered symptom checker integrated into the intake form.",
    status: "In Progress",
    skills: ["Full Stack", "React", "Node.js", "MongoDB"],
    events: ["Health Hackathon 2024"],
    github: ""
  },
  {
    title: "Blockchain-Based Certificate Verification",
    category: "project", domain: "Blockchain",
    technologies: ["Solidity", "Ethereum", "Web3.js", "React", "IPFS"],
    department: "CSE", team: "ChainCert", year: "2023–24",
    problem: "Fake certificates are rampant; verification is slow and manual.",
    solution: "Certificates are hashed and stored on Ethereum blockchain for tamper-proof verification.",
    features: ["Certificate minting", "QR-based verification", "Issuer dashboard", "Public ledger"],
    innovation: "First college project to use IPFS for decentralized certificate storage.",
    status: "Completed",
    skills: ["Blockchain", "Solidity", "Web3"],
    events: ["Blockchain Hackathon 2023"],
    github: "https://github.com/example/cert-chain"
  },
  {
    title: "AI Chatbot for College FAQ",
    category: "project", domain: "Natural Language Processing",
    technologies: ["Python", "NLTK", "TensorFlow", "Flask", "React"],
    department: "CSE", team: "NLP Squad", year: "2024–25",
    problem: "Students repeatedly ask the same questions; staff time is wasted.",
    solution: "NLP-powered chatbot trained on college FAQ data to answer student queries 24/7.",
    features: ["Intent classification", "Context memory", "Multi-language support", "Admin training panel"],
    innovation: "Self-learning model that improves with each conversation.",
    status: "Completed",
    skills: ["NLP", "Deep Learning", "Python", "React"],
    events: ["AI Fest 2024"],
    github: ""
  },
  {
    title: "E-Waste Management Platform",
    category: "project", domain: "Sustainability",
    technologies: ["Flutter", "Firebase", "Google Maps API", "Python"],
    department: "CSE", team: "GreenCode", year: "2023–24",
    problem: "E-waste disposal is unorganized; people don't know where to drop devices.",
    solution: "Mobile app that locates nearby e-waste collection centers and schedules pickups.",
    features: ["Nearby center locator", "Pickup scheduling", "Reward points", "Impact tracker"],
    innovation: "Gamification with reward points redeemable for discounts.",
    status: "Completed",
    skills: ["Flutter", "Firebase", "Mobile Dev"],
    events: ["Green Hackathon 2023"],
    github: "https://github.com/example/ewaste"
  },
  {
    title: "Sign Language Recognition System",
    category: "project", domain: "Artificial Intelligence",
    technologies: ["Python", "MediaPipe", "TensorFlow", "OpenCV", "Streamlit"],
    department: "CSE", team: "AccessTech", year: "2024–25",
    problem: "Communication barrier between hearing-impaired and non-signers.",
    solution: "Real-time hand gesture recognition that translates sign language to text and speech.",
    features: ["26 ASL alphabets", "Word prediction", "Text-to-speech output", "Live webcam feed"],
    innovation: "Works offline with 94% accuracy using lightweight MobileNet.",
    status: "Completed",
    skills: ["Computer Vision", "TensorFlow", "Python"],
    events: ["Accessibility Hackathon 2024"],
    github: ""
  }
];

// ── KEYWORD MAPS for NLP matching ────────────
const DOMAIN_KEYWORDS = {
  ai:           ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "neural", "nlp", "computer vision"],
  python:       ["python"],
  iot:          ["iot", "internet of things", "arduino", "sensor", "embedded", "nodemcu"],
  cybersecurity:["cyber", "cybersecurity", "security", "threat", "network security", "hacking"],
  healthcare:   ["health", "healthcare", "medical", "hospital", "patient"],
  blockchain:   ["blockchain", "crypto", "ethereum", "solidity", "web3", "certificate"],
  web:          ["web", "react", "node", "fullstack", "full stack", "javascript", "html"],
  mobile:       ["mobile", "flutter", "android", "ios", "app"],
  final:        ["final year", "final", "capstone"],
  cse:          ["cse", "computer science", "cs"],
  sustainability:["green", "environment", "sustainability", "ewaste", "e-waste"],
  accessibility:["accessibility", "sign language", "disability", "hearing"],
  agriculture:  ["agriculture", "farm", "crop", "agri"],
  "2nd year":   ["2nd year", "second year", "sophomore"],
  "3rd year":   ["3rd year", "third year"],
  "4th year":   ["4th year", "fourth year", "final year"],
};

// ── PANEL STATE ───────────────────────────────
let _lastResults = [];

function openAIAssistant() {
  document.getElementById('aiOverlay').classList.add('open');
  document.getElementById('aiPanel').classList.add('open');
  const msgs = document.getElementById('aiMessages');
  if (!msgs.children.length) {
    addBotMessage("Hi! I'm your <strong>AI Project Assistant</strong>. I can help you find and explore student projects.<br><br>Try asking: <em>\"Find AI projects\"</em> or <em>\"Show IoT projects\"</em>");
  }
  setTimeout(() => document.getElementById('aiInput').focus(), 350);
}

function closeAIAssistant() {
  document.getElementById('aiOverlay').classList.remove('open');
  document.getElementById('aiPanel').classList.remove('open');
}

function aiQuery(text) {
  document.getElementById('aiInput').value = text;
  sendAIMessage();
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  showTyping();
  setTimeout(() => { removeTyping(); processQuery(text); }, 700);
}

// ── MESSAGE RENDERERS ─────────────────────────
function addUserMessage(text) {
  appendMsg(`<div class="ai-msg user">
    <div class="ai-msg-avatar"><i class="fas fa-user"></i></div>
    <div class="ai-msg-bubble">${escHtml(text)}</div>
  </div>`);
}

function addBotMessage(html) {
  appendMsg(`<div class="ai-msg bot">
    <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="ai-msg-bubble">${html}</div>
  </div>`);
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'ai-msg bot'; el.id = 'aiTyping';
  el.innerHTML = `<div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
  document.getElementById('aiMessages').appendChild(el);
  scrollChat();
}

function removeTyping() {
  const t = document.getElementById('aiTyping');
  if (t) t.remove();
}

function appendMsg(html) {
  const msgs = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.innerHTML = html;
  msgs.appendChild(div.firstElementChild);
  scrollChat();
}

function scrollChat() {
  const msgs = document.getElementById('aiMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── QUERY PROCESSOR ───────────────────────────
function processQuery(text) {
  const q = text.toLowerCase();

  // Detail request for a specific project
  if (/tell me about|explain|detail|describe|more about/.test(q)) {
    const idx = extractProjectIndex(q);
    if (idx !== null && _lastResults[idx]) {
      showProjectDetail(_lastResults[idx]);
      return;
    }
    // Try to match by title keyword
    const matched = findProjectByKeyword(q);
    if (matched) { showProjectDetail(matched); return; }
    addBotMessage("Please first search for projects, then ask me to explain a specific one (e.g. <em>\"Tell me about project 1\"</em>).");
    return;
  }

  // Greeting
  if (/^(hi|hello|hey|hii|helo)/.test(q)) {
    addBotMessage("Hello! How can I help you today? Try searching for projects by domain, technology, or year.");
    return;
  }

  // Help
  if (/help|what can you|how to use/.test(q)) {
    addBotMessage(`I can help you:<br>
      • <strong>Search projects</strong> – "Find AI projects", "Show Python projects"<br>
      • <strong>Filter by domain</strong> – "Healthcare projects", "IoT projects"<br>
      • <strong>Get details</strong> – "Tell me about project 1" or "Explain the blockchain project"<br>
      • <strong>Filter by year</strong> – "Show 2024-25 projects"`);
    return;
  }

  // Search
  const results = searchProjects(q);
  _lastResults = results;

  if (!results.length) {
    addBotMessage("I couldn't find any projects matching <strong>\"" + escHtml(text) + "\"</strong>.<br>Try: <em>AI, IoT, Python, cybersecurity, healthcare, blockchain</em>");
    return;
  }

  let html = `Found <strong>${results.length}</strong> project${results.length > 1 ? 's' : ''} matching your query:<br><br>`;
  results.forEach((p, i) => {
    html += buildProjectCard(p, i + 1);
  });
  html += `<br><small style="color:#475569">Click a card or ask <em>"Tell me about project 1"</em> for full details.</small>`;
  addBotMessage(html);
}

// ── SEARCH ENGINE ─────────────────────────────
function searchProjects(q) {
  const matched = new Set();

  // Match against domain keywords
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(k => q.includes(k))) {
      PROJECT_KB.forEach(p => {
        const haystack = [p.domain, ...p.technologies, ...p.skills, ...p.features, p.title, p.department, p.year].join(' ').toLowerCase();
        if (keywords.some(k => haystack.includes(k))) matched.add(p);
      });
    }
  }

  // Also search DB.achievements if available
  if (typeof DB !== 'undefined') {
    const tokens = q.split(/\s+/).filter(t => t.length > 2);
    DB.achievements.forEach(a => {
      const hay = [a.title, a.student, a.event, a.desc || '', a.category].join(' ').toLowerCase();
      if (tokens.some(t => hay.includes(t))) {
        // Wrap as project-like object
        const kb = PROJECT_KB.find(p => p.title.toLowerCase() === a.title.toLowerCase());
        matched.add(kb || {
          title: a.title, category: a.category, domain: getCatLabel(a.category),
          technologies: [], department: "CSE", team: a.team || a.student,
          year: a.year, problem: a.desc || "—", solution: "—",
          features: [], innovation: "—", status: a.verified ? "Verified" : "Pending",
          skills: [], events: [a.event], github: ""
        });
      }
    });
  }

  // Direct title/keyword match in KB
  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  PROJECT_KB.forEach(p => {
    const hay = [p.title, p.domain, ...p.technologies, ...p.skills].join(' ').toLowerCase();
    if (tokens.some(t => hay.includes(t))) matched.add(p);
  });

  return [...matched].slice(0, 6);
}

function getCatLabel(catId) {
  if (typeof DB === 'undefined') return catId;
  const c = DB.categories.find(x => x.id === catId);
  return c ? c.label : catId;
}

function findProjectByKeyword(q) {
  return PROJECT_KB.find(p => p.title.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w)));
}

function extractProjectIndex(q) {
  const m = q.match(/project\s*#?(\d+)/i);
  if (m) return parseInt(m[1]) - 1;
  return null;
}

// ── CARD & DETAIL BUILDERS ────────────────────
function buildProjectCard(p, num) {
  const techTags = p.technologies.slice(0, 3).map(t => `<span class="ai-proj-tag tech">${t}</span>`).join('');
  const onclick = `onAICardClick(${num - 1})`;
  return `<div class="ai-project-card" onclick="${onclick}">
    <div class="ai-proj-title">${num}. ${escHtml(p.title)}</div>
    <div class="ai-proj-meta">
      <span class="ai-proj-tag">${escHtml(p.domain)}</span>
      ${techTags}
      <span class="ai-proj-tag dept">${escHtml(p.department)}</span>
      <span class="ai-proj-tag year">${escHtml(p.year)}</span>
    </div>
    <div class="ai-proj-desc">${escHtml(p.problem.substring(0, 90))}${p.problem.length > 90 ? '…' : ''}</div>
    <div class="ai-proj-more">Click to view full details &rarr;</div>
  </div>`;
}

function onAICardClick(idx) {
  if (_lastResults[idx]) showProjectDetail(_lastResults[idx]);
}

function showProjectDetail(p) {
  const githubRow = p.github
    ? `<div class="ai-detail-row"><div class="ai-detail-label">GitHub / Demo</div><div class="ai-detail-val"><a href="${p.github}" target="_blank" style="color:#818cf8">${p.github}</a></div></div>`
    : '';

  const html = `<strong style="color:#c7d2fe;font-size:0.9rem">${escHtml(p.title)}</strong>
  <div class="ai-detail-section">
    <div class="ai-detail-divider"></div>
    ${row('Project Title', p.title)}
    ${row('Category', p.domain)}
    ${row('Related Domain', p.domain)}
    ${row('Technologies', p.technologies.join(', ') || '—')}
    ${row('Department', p.department)}
    ${row('Student / Team', p.team || '—')}
    ${row('Year', p.year)}
    <div class="ai-detail-divider"></div>
    ${row('Problem Statement', p.problem)}
    ${row('Proposed Solution', p.solution)}
    ${row('Key Features', Array.isArray(p.features) ? p.features.join(' • ') : p.features)}
    ${row('Innovation', p.innovation)}
    <div class="ai-detail-divider"></div>
    ${row('Project Status', p.status)}
    ${row('Related Skills', Array.isArray(p.skills) ? p.skills.join(', ') : p.skills)}
    ${row('Events / Hackathons', Array.isArray(p.events) ? p.events.join(', ') : p.events)}
    ${githubRow}
  </div>`;

  addBotMessage(html);
}

function row(label, val) {
  if (!val || val === '—' || (Array.isArray(val) && !val.length)) return '';
  return `<div class="ai-detail-row">
    <div class="ai-detail-label">${label}</div>
    <div class="ai-detail-val">${escHtml(String(val))}</div>
  </div>`;
}

// ── OPEN/CLOSE HELPERS ────────────────────────
window.openAIAssistant  = openAIAssistant;
window.closeAIAssistant = closeAIAssistant;
window.sendAIMessage    = sendAIMessage;
window.aiQuery          = aiQuery;
window.onAICardClick    = onAICardClick;
