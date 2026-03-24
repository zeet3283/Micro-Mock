// ── CONFIG ──
var SB = 'https://xkijsokwttuypxcgppbe.supabase.co';
var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraWpzb2t3dHR1eXB4Y2dwcGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODE4NzcsImV4cCI6MjA4ODY1Nzg3N30.GVnoXPvWaPtStQpqRV5ozUwjb-JJhhl1Iba660Z8aa8';
var H = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };
var EDGE_URL = 'https://xkijsokwttuypxcgppbe.supabase.co/functions/v1/chat';

// ── CONSTANTS ──
var LEVELS = [
  { n: 'Rookie', i: '⚡', min: 0 },
  { n: 'Aspirant', i: '📚', min: 100 },
  { n: 'Scholar', i: '🎓', min: 300 },
  { n: 'Expert', i: '🏅', min: 600 },
  { n: 'Champion', i: '🏆', min: 1000 }
];
var QUOTES = [
  ['The secret of getting ahead is getting started.', 'Mark Twain'],
  ['Success is not final, failure is not fatal.', 'Winston Churchill'],
  ['It always seems impossible until it\'s done.', 'Nelson Mandela'],
  ['Hard work beats talent when talent doesn\'t work hard.', 'Tim Notke'],
  ['The future belongs to those who prepare for it today.', 'Malcolm X'],
  ['Believe you can and you\'re halfway there.', 'Theodore Roosevelt']
];
var NAV_SVG = {
  home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  ranks: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 21h8M12 17v4M17 7l-5-5-5 5v10h10z"/><path d="M6 7H2v10h4M22 7h-4v10h4"/></svg>',
  profile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};
var LOGO_SVG = '<svg width="26" height="26" viewBox="0 0 72 72" fill="none"><rect width="72" height="72" rx="20" fill="url(#nl1)"/><path d="M40 14L22 40h14l-4 18 22-24H40L42 14z" fill="white"/><circle cx="52" cy="52" r="12" fill="url(#nl2)"/><path d="M47 52l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="nl1" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient><linearGradient id="nl2" x1="40" y1="40" x2="64" y2="64"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs></svg>';

// ── STATE ──
var U = null, P = null;
var QS = [], QI = 0, SC = 0, DN = false, tmr = null, TL = 600, T0 = null, EX = null;
var chatCtx = null, chatMsgs = [], aiLeft = 3, sending = false;
var tt, tto;

// ── HELPERS ──
function toast(m, t) {
  var ti = document.getElementById('t-inner');
  ti.textContent = m;
  ti.style.background = t === 'ok' ? 'rgba(16,185,129,.15)' : t === 'err' ? 'rgba(244,63,94,.15)' : 'rgba(13,17,23,.97)';
  ti.style.borderColor = t === 'ok' ? 'rgba(16,185,129,.3)' : t === 'err' ? 'rgba(244,63,94,.3)' : 'rgba(255,255,255,.1)';
  var el = document.getElementById('toast');
  el.classList.add('on');
  clearTimeout(tto);
  tto = setTimeout(function () { el.classList.remove('on'); }, 2500);
}

function go(id) {
  document.querySelectorAll('.pg').forEach(function (p) { p.classList.remove('on'); });
  var target = document.getElementById(id);
  if (target) target.classList.add('on');
  if (id === 'lb') renderLB();
  if (id === 'pf') renderPF();
}

function avUrl(seed) {
  return 'https://api.dicebear.com/7.x/shapes/svg?seed=' + encodeURIComponent(seed || 'default') + '&backgroundColor=6366f1,8b5cf6,10b981,f59e0b,22d3ee&backgroundType=gradientLinear';
}

function setImgSrc(id, seed) {
  var el = document.getElementById(id);
  if (el) el.src = avUrl(seed);
}

function getLvl(xp) {
  for (var i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function updLvlUI(xp) {
  var l = getLvl(xp);
  var idx = LEVELS.findIndex(function (x) { return x.n === l.n; });
  var nxt = LEVELS[idx + 1];
  var pct = nxt ? Math.round((xp - l.min) / (nxt.min - l.min) * 100) : 100;
  var nxtXp = nxt ? nxt.min : l.min;
  ['level-icon', 'pf-level-icon'].forEach(function (id) { var e = document.getElementById(id); if (e) e.textContent = l.i; });
  ['level-nm', 'pf-level-nm'].forEach(function (id) { var e = document.getElementById(id); if (e) e.textContent = l.n; });
  var xc = document.getElementById('xp-count'); if (xc) xc.textContent = xp + ' / ' + nxtXp + ' XP';
  var xf = document.getElementById('xp-fill'); if (xf) xf.style.width = pct + '%';
  var hx = document.getElementById('hxp'); if (hx) hx.textContent = xp;
}

// ── API ──
async function api(t, q) {
  try { var r = await fetch(SB + '/rest/v1/' + t + (q || ''), { headers: H }); return r.ok ? await r.json() : []; }
  catch (e) { return []; }
}
async function ins(t, d) {
  try { var r = await fetch(SB + '/rest/v1/' + t, { method: 'POST', headers: Object.assign({}, H, { 'Prefer': 'return=representation' }), body: JSON.stringify(d) }); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}
async function patch(t, q, d) {
  try { var r = await fetch(SB + '/rest/v1/' + t + q, { method: 'PATCH', headers: Object.assign({}, H, { 'Prefer': 'return=representation' }), body: JSON.stringify(d) }); return r.ok ? await r.json() : null; }
  catch (e) { return null; }
}

// ── AUTH ──
async function init() {
  try {
    var hash = location.hash;
    if (hash && hash.includes('access_token')) {
      var params = new URLSearchParams(hash.slice(1));
      var tk = params.get('access_token');
      if (tk) {
        localStorage.setItem('mm_tk', tk);
        history.replaceState(null, '', location.pathname);
      }
    }

    var token = localStorage.getItem('mm_tk');
    if (!token) { go('lg'); return; }

    var ctrl = new AbortController();
    var tid = setTimeout(function () { ctrl.abort(); }, 6000);
    var res = await fetch(SB + '/auth/v1/user', {
      headers: Object.assign({}, H, { 'Authorization': 'Bearer ' + token }),
      signal: ctrl.signal
    });
    clearTimeout(tid);

    if (!res.ok) { localStorage.removeItem('mm_tk'); go('lg'); return; }

    U = await res.json();

    var profileArr = await api('users', '?id=eq.' + U.id + '&limit=1');
    if (profileArr && profileArr.length > 0) {
      P = profileArr[0];
      if (!P.name || P.name.trim() === '') { go('ob'); return; }
      await renderHM();
    } else {
      go('ob');
    }
  } catch (err) {
    console.error('Init failed:', err.name, err.message);
    localStorage.removeItem('mm_tk');
    go('lg');
  }
}

// ── BOOT ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
} else {
  setTimeout(init, 100);
}

function stab(t) {
  document.querySelectorAll('.atab').forEach(function (tab, i) { tab.classList.toggle('on', ['social', 'email', 'phone'][i] === t); });
  document.querySelectorAll('.aform').forEach(function (f) { f.classList.remove('on'); });
  document.getElementById('tab-' + t).classList.add('on');
}

async function signEmail() {
  var em = document.getElementById('em-inp').value.trim();
  var pw = document.getElementById('pw-inp').value;
  if (!em || !pw) { toast('Enter email and password', 'err'); return; }
  toast('Signing in...');
  try {
    var r = await fetch(SB + '/auth/v1/token?grant_type=password', { method: 'POST', headers: H, body: JSON.stringify({ email: em, password: pw }) });
    var d = await r.json();
    if (d.access_token) { localStorage.setItem('mm_tk', d.access_token); init(); }
    else toast('Wrong email or password', 'err');
  } catch (e) { toast('Error. Try Google.', 'err'); }
}

async function signUpEmail() {
  var em = document.getElementById('em-inp').value.trim();
  var pw = document.getElementById('pw-inp').value;
  if (!em || !pw) { toast('Enter email and password', 'err'); return; }
  if (pw.length < 6) { toast('Password must be at least 6 characters', 'err'); return; }
  toast('Creating your account...');
  try {
    var r = await fetch(SB + '/auth/v1/signup', { method: 'POST', headers: H, body: JSON.stringify({ email: em, password: pw }) });
    var d = await r.json();
    if (d.access_token) { localStorage.setItem('mm_tk', d.access_token); init(); }
    else if (d.id) toast('Check your email for a confirmation link!', 'ok');
    else toast(d.msg || 'Error. Try Google instead.', 'err');
  } catch (e) { toast('Error. Try Google.', 'err'); }
}

function logout() { localStorage.removeItem('mm_tk'); U = null; P = null; go('lg'); }

function pEx(el, ex) {
  document.querySelectorAll('.exam-card').forEach(function (e) { e.classList.remove('sel'); });
  el.classList.add('sel'); EX = ex;
}

async function fOb() {
  var nm = document.getElementById('obn').value.trim();
  if (!nm) { toast('Enter your name', 'err'); return; }
  if (!EX) { toast('Select your exam', 'err'); return; }
  var tk = localStorage.getItem('mm_tk');
  var trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await fetch(SB + '/rest/v1/users', {
      method: 'POST',
      headers: Object.assign({}, H, { 'Authorization': 'Bearer ' + tk, 'Prefer': 'return=representation' }),
      body: JSON.stringify({ id: U.id, email: U.email, name: nm, exam_target: EX, plan: 'free', trial_ends_at: trialEnd, xp: 0, level: 1 })
    });
  } catch (e) {}
  P = { id: U.id, email: U.email, name: nm, exam_target: EX, plan: 'free', xp: 0, level: 1, trial_ends_at: trialEnd };
  toast('Welcome! 7-day Pro trial is active 🎉', 'ok');
  await renderHM();
  go('hm');
}

// ── TRIAL ──
async function startTrial() {
  if (!U) return;
  var trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await patch('users', '?id=eq.' + U.id, { trial_ends_at: trialEnd });
  if (P) P.trial_ends_at = trialEnd;
  toast('🎉 7-day Pro trial activated!', 'ok');
  setTimeout(function () { renderHM(); }, 800);
}

// ── HOME ──
async function renderHM() {
  go('hm');

  var el = document.getElementById('hm');
  var nm = (P && P.name) || 'Aspirant';
  var seed = U ? U.id : nm;
  var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  var xp = P && P.xp ? parseInt(P.xp) : 0;

  var trialHTML = '';
  if (P && P.trial_ends_at) {
    var diff = Math.ceil((new Date(P.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff <= 7) {
      trialHTML = '<div class="trial-banner">'
        + '<div class="tb-ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg></div>'
        + '<div style="flex:1"><div class="tb-days">' + diff + '</div><div class="tb-label">days of Pro trial remaining</div></div>'
        + '<button class="tb-btn" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Upgrade</button>'
        + '</div>';
    }
  }

  el.innerHTML = '<div class="nav">'
    + '<div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div>'
    + '<div class="nav-right"><div class="user-av" id="hav" onclick="go(\'pf\')"><img id="hav-img" src="' + avUrl(seed) + '" alt=""/></div></div>'
    + '</div>'
    + '<div class="hbody">'
    + '<div class="greet"><div><div class="greet-sub">Good to see you 👋</div><div class="greet-name">' + nm + '</div></div>'
    + '<div class="streak-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="#FCD34D"><path d="M12 2c0 0-6 6-6 12a6 6 0 0 0 12 0c0-6-6-12-6-12z"/></svg><span id="hst">0</span></div></div>'
    + trialHTML
    + '<div class="xp-bar-wrap"><div class="xp-top"><div class="level-badge"><span id="level-icon">⚡</span><span class="level-name" id="level-nm">Rookie</span></div><span class="xp-count" id="xp-count">' + xp + ' / 100 XP</span></div><div class="xp-track"><div class="xp-fill" id="xp-fill" style="width:0%"></div></div></div>'
    + '<div class="qhero"><div class="qhero-orb1"></div><div class="qhero-orb2"></div>'
    + '<div class="live-tag"><div class="live-dot"></div><div class="live-label">Live Now</div></div>'
    + '<div class="qhero-t" id="htl">Daily MCQ Challenge</div>'
    + '<div class="qhero-pills"><span class="pill" id="hpill">' + ((P && P.exam_target) || 'UPSC') + '</span><span class="pill">10 Questions</span><span class="pill">10 Min</span></div>'
    + '<button class="btn btn-p" id="bsq" onclick="bQz()" style="position:relative;z-index:1">Start Today\'s Quiz →</button>'
    + '</div>'
    + '<div class="stats-grid">'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#6366F1,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent" id="hac">--</div><div class="stat-lbl">Accuracy</div></div>'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#10B981,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent" id="hqz">--</div><div class="stat-lbl">Quizzes</div></div>'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#F59E0B,#F97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent" id="hxp">' + xp + '</div><div class="stat-lbl">XP</div></div>'
    + '</div>'
    + '<div style="font-size:15px;font-weight:800;margin-bottom:12px">Practice by Subject</div>'
    + '<div class="subj-grid">'
    + '<div class="subj-card" onclick="toast(\'GS coming soon!\')"><div class="subj-ico" style="background:rgba(99,102,241,.1)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><div><div class="subj-nm">General Studies</div><div class="subj-info">Polity · History</div></div></div>'
    + '<div class="subj-card" onclick="toast(\'Reasoning coming soon!\')"><div class="subj-ico" style="background:rgba(245,158,11,.1)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div><div><div class="subj-nm">Reasoning</div><div class="subj-info">Logical · Verbal</div></div></div>'
    + '<div class="subj-card" onclick="toast(\'Quant coming soon!\')"><div class="subj-ico" style="background:rgba(16,185,129,.1)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg></div><div><div class="subj-nm">Quantitative</div><div class="subj-info">Arithmetic · DI</div></div></div>'
    + '<div class="subj-card" onclick="toast(\'Current Affairs coming soon!\')"><div class="subj-ico" style="background:rgba(34,211,238,.1)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#67E8F9" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0H2v-2a2 2 0 0 1 2-2v4z"/></svg></div><div><div class="subj-nm">Current Affairs</div><div class="subj-info">News · Events</div></div></div>'
    + '</div>'
    + '<div class="quote"><div class="q-tag">Daily Fuel</div><div class="q-txt">"' + q[0] + '"</div><div class="q-by">— ' + q[1] + '</div></div>'
    + '</div>'
    + '<div class="bnav">'
    + '<div class="bn on" onclick="go(\'hm\')">' + NAV_SVG.home + 'Home</div>'
    + '<div class="bn" onclick="go(\'lb\')">' + NAV_SVG.ranks + 'Ranks</div>'
    + '<div class="bn" onclick="go(\'pf\')">' + NAV_SVG.profile + 'Profile</div>'
    + '</div>';

  document.getElementById('ai-fab').style.display = 'flex';
  updLvlUI(xp);
  aiLeft = (P && P.plan === 'pro') ? 999 : 3;
  updateAiCount();

  api('user_attempts', '?user_id=eq.' + U.id + '&limit=30').then(function (at) {
    if (!at || !at.length) return;
    var avg = at.reduce(function (s, a) { return s + parseFloat(a.accuracy_pct || 0); }, 0) / at.length;
    var hac = document.getElementById('hac'); if (hac) hac.textContent = Math.round(avg) + '%';
    var hqz = document.getElementById('hqz'); if (hqz) hqz.textContent = at.length;
    var hst = document.getElementById('hst'); if (hst) hst.textContent = at.length;
  });

  var td = new Date().toISOString().split('T')[0];
  api('quizzes', '?scheduled_for=eq.' + td + '&is_published=eq.true&limit=1').then(function (qz) {
    if (!qz || !qz.length) return;
    var htl = document.getElementById('htl'); if (htl) htl.textContent = qz[0].title;
    var hp = document.getElementById('hpill'); if (hp) hp.textContent = qz[0].exam_target;
  });
}

// ── QUIZ ──
async function bQz() {
  var b = document.getElementById('bsq'); if (!b) return;
  b.disabled = true; b.textContent = 'Loading...';
  var td = new Date().toISOString().split('T')[0];
  var qz = await api('quizzes', '?scheduled_for=eq.' + td + '&is_published=eq.true&limit=1');
  if (!qz || !qz.length) qz = await api('quizzes', '?is_published=eq.true&order=created_at.desc&limit=1');
  if (!qz || !qz.length) { toast('No quiz yet! Check back soon 📚'); if (b) { b.disabled = false; b.textContent = 'Start Today\'s Quiz →'; } return; }
  var qq = await api('questions', '?quiz_id=eq.' + qz[0].id + '&limit=10');
  if (!qq || !qq.length) { toast('Questions loading soon!'); if (b) { b.disabled = false; b.textContent = 'Start Today\'s Quiz →'; } return; }
  QS = qq; QI = 0; SC = 0; TL = 600; T0 = Date.now(); chatCtx = null;
  renderQZ(); rQ(); sTmr();
}

function renderQZ() {
  var el = document.getElementById('qz');
  el.innerHTML =
    '<div class="nav">' +
      '<button onclick="if(confirm(\'Quit? Progress lost.\')){clearInterval(tmr);renderHM()}" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Quit</button>' +
      '<div class="q-ctr" id="qct">Q 1 / 10</div>' +
      '<div class="q-timer"><div class="tdot"></div><span id="qtm">10:00</span></div>' +
    '</div>' +
    '<div class="qbody">' +
      '<div class="prog-track"><div class="prog-fill" id="qpr" style="width:10%"></div></div>' +
      '<div class="q-subj" id="qdf">General Studies · Medium</div>' +
      '<div class="q-txt" id="qtx">Loading...</div>' +
      '<div class="opts" id="qop"></div>' +
      '<div class="exp" id="qex"><div class="exp-t">Explanation</div><div class="exp-body" id="qxt"></div></div>' +
      '<button class="ask-ai-btn" id="ask-ai-q-btn" style="display:none" onclick="openChatWithContext()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>Ask AI to explain this</button>' +
    '</div>' +
    '<div class="q-foot"><button class="btn btn-p" id="bnx" onclick="nQ()" disabled>Select an answer</button></div>';
  go('qz');
}

function rQ() {
  var q = QS[QI];
  var pEl = document.getElementById('qpr'); if (pEl) pEl.style.width = ((QI + 1) / QS.length * 100) + '%';
  var cEl = document.getElementById('qct'); if (cEl) cEl.textContent = 'Q ' + (QI + 1) + ' / ' + QS.length;
  var dEl = document.getElementById('qdf'); if (dEl) dEl.textContent = (q.subject || 'GS') + ' · ' + (q.difficulty || 'medium')[0].toUpperCase() + (q.difficulty || 'medium').slice(1);
  var tEl = document.getElementById('qtx'); if (tEl) tEl.textContent = q.question_text;
  var exEl = document.getElementById('qex'); if (exEl) exEl.style.display = 'none';
  var aBtn = document.getElementById('ask-ai-q-btn'); if (aBtn) aBtn.style.display = 'none';
  var oc = document.getElementById('qop'); if (!oc) return;
  oc.innerHTML = '';
  ['A', 'B', 'C', 'D'].forEach(function (lt, i) {
    var v = [q.option_a, q.option_b, q.option_c, q.option_d];
    var b = document.createElement('button'); b.className = 'opt';
    b.innerHTML = '<div class="opt-l">' + lt + '</div><span>' + v[i] + '</span>';
    b.onclick = function () { pA(lt, q); };
    oc.appendChild(b);
  });
  DN = false;
  var nb = document.getElementById('bnx');
  if (nb) { nb.disabled = true; nb.textContent = 'Select an answer'; }
}

function pA(lt, q) {
  if (DN) return; DN = true;
  document.querySelectorAll('.opt').forEach(function (b) {
    var l = b.querySelector('.opt-l').textContent;
    if (l === q.correct_option) b.classList.add('ok');
    else if (l === lt && lt !== q.correct_option) b.classList.add('no');
  });
  if (lt === q.correct_option) { SC++; toast('Correct! +10 XP ⚡', 'ok'); }
  else toast('Wrong ✗', 'err');
  if (q.explanation) {
    var xt = document.getElementById('qxt'); if (xt) xt.textContent = q.explanation;
    var xe = document.getElementById('qex'); if (xe) xe.style.display = 'block';
  }
  var ab = document.getElementById('ask-ai-q-btn'); if (ab) ab.style.display = 'flex';
  chatCtx = { question: q.question_text, answer: q.correct_option, explanation: q.explanation || '', userAnswer: lt };
  var nb = document.getElementById('bnx');
  if (nb) { nb.disabled = false; nb.textContent = QI < QS.length - 1 ? 'Next Question →' : 'View Results →'; }
}

function nQ() { if (!DN) return; QI++; if (QI >= QS.length) { eQz(); return; } rQ(); }

async function eQz() {
  clearInterval(tmr);
  var sec = Math.round((Date.now() - T0) / 1000);
  var acc = Math.round(SC / QS.length * 100);
  var xpGained = SC * 10 + (QS.length - SC) * 2;
  await ins('user_attempts', { user_id: U.id, quiz_id: QS[0].quiz_id, score: SC, total_questions: QS.length, accuracy_pct: acc, time_taken_sec: sec });
  var newXp = (P && P.xp ? parseInt(P.xp) : 0) + xpGained;
  await patch('users', '?id=eq.' + U.id, { xp: newXp });
  if (P) P.xp = newXp;

  var beatTxt = 'First attempt today! 🌟';
  var all = await api('user_attempts', '?quiz_id=eq.' + QS[0].quiz_id);
  if (all && all.length > 1) {
    var beat = all.filter(function (a) { return parseFloat(a.score) < SC; }).length;
    beatTxt = 'Beat ' + Math.round(beat / (all.length - 1) * 100) + '% today';
  }

  renderRS(SC, acc, sec, xpGained, beatTxt);
  if (SC >= 7) confetti();
  chatCtx = null;
  go('rs');
}

function sTmr() {
  clearInterval(tmr);
  tmr = setInterval(function () {
    TL--;
    var m = Math.floor(TL / 60).toString().padStart(2, '0');
    var s = (TL % 60).toString().padStart(2, '0');
    var te = document.getElementById('qtm'); if (te) te.textContent = m + ':' + s;
    if (TL <= 0) { clearInterval(tmr); eQz(); }
    if (TL <= 60 && te) te.style.color = '#F43F5E';
  }, 1000);
}

// ── RESULTS ──
function renderRS(score, acc, sec, xpGained, beatTxt) {
  var seed = U ? U.id : 'user';
  var title = score >= 8 ? 'Outstanding!' : score >= 6 ? 'Great Job!' : score >= 4 ? 'Keep Going!' : 'Keep Practicing!';
  var el = document.getElementById('rs');
  el.innerHTML =
    '<div id="conf-wrap"></div>' +
    '<div class="res-wrap">' +
      '<div class="res-main">' +
        '<div class="res-glow"></div>' +
        '<div class="res-av"><img src="' + avUrl(seed) + '" alt=""/></div>' +
        '<div class="res-score">' + score + '<span>/10</span></div>' +
        '<div class="res-title">' + title + '</div>' +
        '<div class="res-sub">Here\'s how you did today</div>' +
        '<div class="xp-earned">+' + xpGained + ' XP ⚡</div>' +
        '<div class="beat-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>' + beatTxt + '</div>' +
      '</div>' +
      '<div class="res-stats">' +
        '<div class="rs-box"><div class="rs-val">' + acc + '%</div><div class="rs-lbl">Accuracy</div></div>' +
        '<div class="rs-box"><div class="rs-val">' + score + '/10</div><div class="rs-lbl">Correct</div></div>' +
        '<div class="rs-box"><div class="rs-val">' + sec + 's</div><div class="rs-lbl">Time</div></div>' +
      '</div>' +
      '<div class="pop-tease"><div class="pt-glow"></div>' +
        '<div class="pt-badge">Pro Feature</div>' +
        '<div class="pt-t">Your PoP Card is Ready 🪪</div>' +
        '<div class="pt-s">Unlock your shareable Proof-of-Preparation card. Show your family you mean business.</div>' +
        '<button class="btn btn-trial" onclick="startTrial()" style="margin-top:4px">Start 7-Day Free Trial →</button>' +
      '</div>' +
      '<button class="btn btn-g" onclick="shareScore(' + score + ',' + acc + ')" style="margin-bottom:10px;gap:8px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share My Score</button>' +
      '<button class="btn btn-g" onclick="renderHM()" style="color:var(--t3)">Back to Home</button>' +
    '</div>';
}

// ── LEADERBOARD ──
async function renderLB() {
  var el = document.getElementById('lb');
  var seed = U ? U.id : 'user';
  el.innerHTML =
    '<div class="nav">' +
      '<div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div>' +
      '<div class="user-av" onclick="go(\'pf\')"><img src="' + avUrl(seed) + '" alt=""/></div>' +
    '</div>' +
    '<div class="lbody">' +
      '<div style="margin-bottom:16px"><div class="h2" style="margin-bottom:4px">Leaderboard</div><div class="body">Today\'s top performers</div></div>' +
      '<div class="my-rank-box" id="my-rank-box" style="display:none"><div style="font-size:12px;color:var(--t3);margin-bottom:4px">Your Position Today</div><div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#6366F1,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent" id="my-rank-n">#--</div></div>' +
      '<div class="podium" id="podium" style="display:none"></div>' +
      '<div class="lb-list" id="lbl"><div style="text-align:center;padding:40px;color:var(--t3)">Loading...</div></div>' +
    '</div>' +
    '<div class="bnav">' +
      '<div class="bn" onclick="renderHM()">' + NAV_SVG.home + 'Home</div>' +
      '<div class="bn on" onclick="go(\'lb\')">' + NAV_SVG.ranks + 'Ranks</div>' +
      '<div class="bn" onclick="go(\'pf\')">' + NAV_SVG.profile + 'Profile</div>' +
    '</div>';

  var data = await api('daily_leaderboard', '?limit=20&order=rank.asc');
  var list = document.getElementById('lbl');
  var pod = document.getElementById('podium');
  if (!data || !data.length) {
    if (pod) pod.style.display = 'none';
    if (list) list.innerHTML = '<div style="text-align:center;padding:56px 16px"><div style="font-size:40px;margin-bottom:14px">🏆</div><div style="font-size:17px;font-weight:800;margin-bottom:6px">No one yet today</div><div style="font-size:13px;color:var(--t3)">Be the first to complete today\'s quiz!</div><button class="btn btn-p" style="margin-top:16px;max-width:200px" onclick="renderHM()">Start Quiz →</button></div>';
    return;
  }
  if (U) {
    var me = data.find(function (d) { return d.id === U.id; });
    if (me) {
      var mrb = document.getElementById('my-rank-box'); if (mrb) mrb.style.display = 'block';
      var mrn = document.getElementById('my-rank-n'); if (mrn) mrn.textContent = '#' + me.rank;
    }
  }
  var top3 = data.slice(0, Math.min(3, data.length));
  if (top3.length >= 3 && pod) {
    pod.style.display = 'flex';
    var order = [top3[1], top3[0], top3[2]], cls = ['pod2', 'pod1', 'pod3'], medals = ['🥈', '🥇', '🥉'], ht = ['68px', '86px', '54px'];
    pod.innerHTML = order.map(function (it, i) {
      return '<div class="pod ' + cls[i] + '"><div style="font-size:20px">' + medals[i] + '</div><div class="pod-av" style="' + (i === 1 ? 'border:2px solid #F59E0B' : i === 0 ? 'border:2px solid #94A3B8' : 'border:2px solid #CD7F32') + '"><img src="' + avUrl(it.id || it.name) + '" alt=""/></div><div class="pod-nm">' + (it.name || 'Aspirant') + '</div><div class="pod-sc">' + it.score + '/10</div><div class="pod-stand" style="height:' + ht[i] + '">' + (i === 1 ? '1' : i === 0 ? '2' : '3') + '</div></div>';
    }).join('');
  } else if (pod) pod.style.display = 'none';

  if (list) {
    list.innerHTML = data.slice(top3.length >= 3 ? 3 : 0).map(function (it) {
      var isMe = U && it.id === U.id;
      return '<div class="lb-row' + (isMe ? ' me' : '') + '"><div class="lb-rk">#' + it.rank + '</div><div class="lb-av"><img src="' + avUrl(it.id || it.name) + '" alt=""/></div><div class="lb-info"><div class="lb-nm">' + (it.name || 'Aspirant') + (isMe ? ' · You' : '') + '</div><div class="lb-ex">' + (it.exam_target || 'UPSC') + '</div></div><div class="lb-right"><div class="lb-sc">' + it.score + '/10</div><div class="lb-acc">' + (it.accuracy_pct || 0) + '%</div></div></div>';
    }).join('');
  }
}

// ── PROFILE ──
async function renderPF() {
  var seed = U ? U.id : 'user';
  var el = document.getElementById('pf');
  var xp = P && P.xp ? parseInt(P.xp) : 0;
  var lvl = getLvl(xp);
  var trialBadge = '';
  if (P && P.trial_ends_at) {
    var diff = Math.ceil((new Date(P.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff > 0) trialBadge = '<div class="badge trial">⏳ ' + diff + ' day trial</div>';
  }

  el.innerHTML =
    '<div class="nav"><div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div></div>' +
    '<div class="pbody">' +
      '<div class="pf-hero"><div class="pf-glow"></div>' +
        '<div class="pf-av"><img id="pf-av-img" src="' + avUrl(seed) + '" alt=""/></div>' +
        '<div class="pf-nm">' + ((P && P.name) || 'Aspirant') + '</div>' +
        '<div class="pf-em">' + (U && U.email ? U.email : '') + '</div>' +
        '<div class="pf-badges"><div class="badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="#A5B4FC"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>Free Plan</div>' + trialBadge + '<div class="badge level">' + lvl.i + ' ' + lvl.n + '</div></div>' +
      '</div>' +
      '<div class="label" style="margin-bottom:11px">Proof of Preparation Card</div>' +
      '<div class="pop-wrap">' +
        '<div class="pop-blur">' +
          '<div class="pop-lock-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>' +
          '<div style="font-size:17px;font-weight:800">PoP Card Locked</div>' +
          '<div style="font-size:13px;color:var(--t2);text-align:center;max-width:220px;line-height:1.6">Start your free trial to unlock and share your preparation identity card</div>' +
          '<button class="btn btn-trial btn-sm" onclick="startTrial()">Start 7-Day Trial Free</button>' +
        '</div>' +
        '<div class="pop-inner">' +
          '<div class="pop-hd"><div class="pop-av"><img src="' + avUrl(seed) + '" alt=""/></div><div><div class="pop-nm" id="pop-nm">' + ((P && P.name) || 'Aspirant') + '</div><div class="pop-sub" id="pop-sub">Preparing for ' + ((P && P.exam_target) || 'UPSC') + '</div></div></div>' +
          '<div class="pop-grid"><div class="pop-s"><div class="pop-sn" id="pd">0</div><div class="pop-sl">Days</div></div><div class="pop-s"><div class="pop-sn" id="pa">0%</div><div class="pop-sl">Accuracy</div></div><div class="pop-s"><div class="pop-sn" id="pq">0</div><div class="pop-sl">Quizzes</div></div></div>' +
          '<div class="pop-bars"><div class="pb-row"><div class="pb-hd"><span>Accuracy</span><span id="gs-p">0%</span></div><div class="pb-bg"><div class="pb-fg" id="gs-b" style="width:0%"></div></div></div><div class="pb-row"><div class="pb-hd"><span>Readiness</span><span id="rd-p">0%</span></div><div class="pb-bg"><div class="pb-fg" id="rd-b" style="width:0%;background:linear-gradient(90deg,#10B981,#22D3EE)"></div></div></div></div>' +
          '<div class="pop-ft"><span style="font-weight:700">micro-mock.in</span><div class="ready-badge" id="pop-ready">0% Ready</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="up-card">' +
        '<div class="up-t">Upgrade to Pro</div>' +
        '<div class="up-s">Unlock your full preparation identity. Your family deserves to see your hard work.</div>' +
        '<div class="up-feats">' +
          '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Ranked leaderboard</div>' +
          '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Shareable PoP Card</div>' +
          '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Unlimited AI questions</div>' +
          '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Full performance history</div>' +
        '</div>' +
        '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')" style="font-size:16px;padding:17px;margin-bottom:10px">Upgrade Now — ₹149/month →</button>' +
      '</div>' +
      '<button class="btn" style="background:rgba(244,63,94,.06);border:1px solid rgba(244,63,94,.18);color:#FDA4AF;margin-top:4px" onclick="logout()">Sign Out</button>' +
    '</div>' +
    '<div class="bnav">' +
      '<div class="bn" onclick="renderHM()">' + NAV_SVG.home + 'Home</div>' +
      '<div class="bn" onclick="go(\'lb\')">' + NAV_SVG.ranks + 'Ranks</div>' +
      '<div class="bn on" onclick="go(\'pf\')">' + NAV_SVG.profile + 'Profile</div>' +
    '</div>';

  api('user_attempts', '?user_id=eq.' + U.id).then(function (at) {
    if (!at || !at.length) return;
    var avg = at.reduce(function (s, a) { return s + parseFloat(a.accuracy_pct || 0); }, 0) / at.length;
    var ar = Math.round(avg);
    var pd = document.getElementById('pd'); if (pd) pd.textContent = at.length;
    var pa = document.getElementById('pa'); if (pa) pa.textContent = ar + '%';
    var pq = document.getElementById('pq'); if (pq) pq.textContent = at.length;
    var gs = document.getElementById('gs-p'); if (gs) gs.textContent = ar + '%';
    var gsb = document.getElementById('gs-b'); if (gsb) gsb.style.width = ar + '%';
    var rd = document.getElementById('rd-p'); if (rd) rd.textContent = Math.min(ar, 100) + '%';
    var rdb = document.getElementById('rd-b'); if (rdb) rdb.style.width = Math.min(ar, 100) + '%';
    var ps = document.getElementById('pop-sub'); if (ps) ps.textContent = 'Preparing for ' + (P && P.exam_target ? P.exam_target : 'UPSC') + ' · Day ' + at.length;
    var pr = document.getElementById('pop-ready'); if (pr) pr.textContent = Math.min(ar, 100) + '% Ready';
  });
}

// ── SHARE ──
function shareScore(score, acc) {
  var txt = '⚡ Micro Mock\n\nScored ' + score + '/10 (' + acc + '%) today!\n\nPreparing daily for govt exam 💪\n\nhttps://zeet3283.github.io/Micro-Mock/';
  if (navigator.share) navigator.share({ title: 'My Score', text: txt });
  else { navigator.clipboard.writeText(txt).catch(function () {}); toast('Score copied! Share anywhere 📤', 'ok'); }
}

// ── CONFETTI ──
function confetti() {
  var cw = document.getElementById('conf-wrap'); if (!cw) return;
  cw.innerHTML = '';
  var cs = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#22D3EE', '#A78BFA'];
  for (var i = 0; i < 90; i++) {
    var c = document.createElement('div'); c.className = 'conf-p';
    c.style.cssText = 'left:' + Math.random() * 100 + '%;top:-10px;background:' + cs[Math.floor(Math.random() * cs.length)] + ';animation-duration:' + (Math.random() * 2 + 2) + 's;animation-delay:' + (Math.random() * 1.5) + 's;width:' + (Math.random() * 9 + 4) + 'px;height:' + (Math.random() * 9 + 4) + 'px;transform:rotate(' + Math.random() * 360 + 'deg)';
    cw.appendChild(c);
  }
  setTimeout(function () { if (cw) cw.innerHTML = ''; }, 6000);
}

// ── AI CHATBOT ──
function updateAiCount() {
  var cnt = document.getElementById('ai-count');
  var badge = document.getElementById('chat-limit-badge');
  if (P && P.plan === 'pro') {
    if (cnt) cnt.style.display = 'none';
    if (badge) badge.textContent = 'Unlimited';
  } else {
    if (cnt) { if (aiLeft < 3) { cnt.style.display = 'flex'; cnt.textContent = aiLeft; } else cnt.style.display = 'none'; }
    if (badge) badge.textContent = aiLeft + ' left today';
  }
}

function openChat() {
  document.getElementById('chat-drawer').classList.add('open');
}

function openChatWithContext() {
  if (chatCtx) {
    var cb = document.getElementById('ctx-banner'); if (cb) cb.style.display = 'flex';
    var ct = document.getElementById('ctx-text'); if (ct) ct.textContent = 'Asking about: "' + chatCtx.question.slice(0, 50) + '..."';
  }
  openChat();
}

function closeChat() {
  document.getElementById('chat-drawer').classList.remove('open');
}

function sendQuick(msg) {
  var inp = document.getElementById('chat-inp'); if (inp) inp.value = msg;
  sendMsg();
}

async function sendMsg() {
  if (sending) return;
  var inp = document.getElementById('chat-inp');
  var msg = inp ? inp.value.trim() : '';
  if (!msg) return;
  if (aiLeft <= 0 && (!P || P.plan !== 'pro')) {
    toast('3 free questions used today. Upgrade for unlimited!', 'err');
    setTimeout(function () { window.open('https://rzp.io/rzp/zJ6jF8B', '_blank'); }, 1200);
    return;
  }
  if (inp) { inp.value = ''; inp.style.height = '44px'; }
  addMsg('user', msg);
  var qc = document.getElementById('quick-chips'); if (qc) qc.style.display = 'none';
  var cb = document.getElementById('ctx-banner'); if (cb) cb.style.display = 'none';

  var typId = 'typ-' + Date.now();
  addTyping(typId);
  sending = true;
  var sendBtn = document.getElementById('chat-send'); if (sendBtn) sendBtn.disabled = true;

  var sys = 'You are a helpful AI assistant for Indian government exam prep (UPSC, SSC, Banking, RBI). Be concise, accurate, encouraging. Keep answers under 150 words. Use simple language.';
  if (chatCtx) sys += '\n\nCurrent question: ' + chatCtx.question + '\nCorrect answer: ' + chatCtx.answer + '\nExplanation: ' + chatCtx.explanation + '\nUser selected: ' + chatCtx.userAnswer;

  var msgs = chatMsgs.slice(-6).concat([{ role: 'user', content: msg }]);

  try {
    var r = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + KEY,
        'apikey': KEY
      },
      body: JSON.stringify({
        messages: msgs,
        system: sys,
        isPro: P && P.plan === 'pro'
      })
    });

    removeTyping(typId);

    if (!r.ok) {
      addMsg('ai', 'Could not connect to AI. Check your internet and try again.');
    } else {
      var d = await r.json();
      var reply = d.reply || 'Sorry, could not answer right now.';
      addMsg('ai', reply);
      chatMsgs.push(
        { role: 'user', content: msg },
        { role: 'assistant', content: reply }
      );
      if (P && P.plan !== 'pro') {
        aiLeft = Math.max(0, aiLeft - 1);
        updateAiCount();
      }
    }
  } catch (e) {
    removeTyping(typId);
    addMsg('ai', 'Something went wrong. Please try again.');
  } finally {
    sending = false;
    var sendBtn2 = document.getElementById('chat-send');
    if (sendBtn2) sendBtn2.disabled = false;
  }
}

function addMsg(role, txt) {
  var msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  var div = document.createElement('div'); div.className = 'msg ' + role;
  var avHtml = role === 'ai'
    ? '<div class="msg-av ai"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg></div>'
    : '<div class="msg-av user"><img src="' + avUrl(U ? U.id : 'user') + '" alt=""/></div>';
  div.innerHTML = avHtml + '<div class="msg-bubble">' + txt.replace(/\n/g, '<br/>') + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping(id) {
  var msgs = document.getElementById('chat-msgs'); if (!msgs) return;
  var div = document.createElement('div'); div.className = 'msg ai'; div.id = id;
  div.innerHTML = '<div class="msg-av ai"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg></div><div class="msg-bubble" style="padding:0"><div class="msg-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping(id) {
  var el = document.getElementById(id); if (el) el.remove();
}
