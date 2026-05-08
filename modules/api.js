// ── CONFIG ──
var SB  = 'https://xkijsokwttuypxcgppbe.supabase.co';
var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraWpzb2t3dHR1eXB4Y2dwcGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODE4NzcsImV4cCI6MjA4ODY1Nzg3N30.GVnoXPvWaPtStQpqRV5ozUwjb-JJhhl1Iba660Z8aa8';
var EDGE_URL = 'https://xkijsokwttuypxcgppbe.supabase.co/functions/v1/Chat';
var GEN_URL  = 'https://xkijsokwttuypxcgppbe.supabase.co/functions/v1/generate-mcq';

// ── AUTH HEADER ──
function getH(extra) {
  var tk = localStorage.getItem('mm_tk');
  var h  = { 'apikey': KEY, 'Authorization': 'Bearer ' + (tk || KEY), 'Content-Type': 'application/json' };
  return extra ? Object.assign({}, h, extra) : h;
}

// ── SECURITY: HTML escape ──
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// ── SECURITY: hash seed for dicebear ──
function hashSeed(str) {
  var h = 5381;
  for (var i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  return (h >>> 0).toString(36);
}

function avUrl(seed) {
  return 'https://api.dicebear.com/7.x/shapes/svg?seed='
    + encodeURIComponent(hashSeed(seed || 'default'))
    + '&backgroundColor=6366f1,8b5cf6,10b981,f59e0b,22d3ee&backgroundType=gradientLinear';
}

// ── REST HELPERS ──
async function api(t, q) {
  try {
    var r = await fetch(SB + '/rest/v1/' + t + (q || ''), { headers: getH() });
    return r.ok ? await r.json() : [];
  } catch (e) { return []; }
}

async function ins(t, d) {
  try {
    var r = await fetch(SB + '/rest/v1/' + t, {
      method: 'POST',
      headers: getH({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(d)
    });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}

async function patch(t, q, d) {
  try {
    var r = await fetch(SB + '/rest/v1/' + t + q, {
      method: 'PATCH',
      headers: getH({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(d)
    });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}

// ── CONSTANTS ──
var LEVELS = [
  { n: 'Rookie',   i: '⚡',  min: 0    },
  { n: 'Aspirant', i: '📚', min: 100  },
  { n: 'Scholar',  i: '🎓', min: 300  },
  { n: 'Expert',   i: '🏅', min: 600  },
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
  home:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  ranks:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 21h8M12 17v4M17 7l-5-5-5 5v10h10z"/><path d="M6 7H2v10h4M22 7h-4v10h4"/></svg>',
  profile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  generate:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  pyq:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
};

var LOGO_SVG = '<svg width="26" height="26" viewBox="0 0 72 72" fill="none"><rect width="72" height="72" rx="20" fill="url(#nl1)"/><path d="M40 14L22 40h14l-4 18 22-24H40L42 14z" fill="white"/><circle cx="52" cy="52" r="12" fill="url(#nl2)"/><path d="M47 52l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="nl1" x1="0" y1="0" x2="72" y2="72"><stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient><linearGradient id="nl2" x1="40" y1="40" x2="64" y2="64"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs></svg>';

// ── SHARED HELPERS ──
var tto;
function toast(m, t) {
  var ti = document.getElementById('t-inner');
  if (!ti) return;
  ti.textContent = m;
  ti.style.background   = t === 'ok'  ? 'rgba(16,185,129,.15)' : t === 'err' ? 'rgba(244,63,94,.15)'  : 'rgba(13,17,23,.97)';
  ti.style.borderColor  = t === 'ok'  ? 'rgba(16,185,129,.3)'  : t === 'err' ? 'rgba(244,63,94,.3)'   : 'rgba(255,255,255,.1)';
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

function getLvl(xp) {
  for (var i = LEVELS.length - 1; i >= 0; i--) { if (xp >= LEVELS[i].min) return LEVELS[i]; }
  return LEVELS[0];
}

function updLvlUI(xp) {
  var l   = getLvl(xp);
  var idx = LEVELS.findIndex(function (x) { return x.n === l.n; });
  var nxt = LEVELS[idx + 1];
  var pct = nxt ? Math.round((xp - l.min) / (nxt.min - l.min) * 100) : 100;
  var nxtXp = nxt ? nxt.min : l.min;
  ['level-icon','pf-level-icon'].forEach(function (id) { var e = document.getElementById(id); if (e) e.textContent = l.i; });
  ['level-nm','pf-level-nm'].forEach(function (id)    { var e = document.getElementById(id); if (e) e.textContent = l.n; });
  var xc = document.getElementById('xp-count'); if (xc) xc.textContent = xp + ' / ' + nxtXp + ' XP';
  var xf = document.getElementById('xp-fill');  if (xf) xf.style.width = pct + '%';
  var hx = document.getElementById('hxp');      if (hx) hx.textContent = xp;
}

function bnav(active) {
  return '<div class="bnav">'
    + '<div class="bn' + (active==='hm'  ?' on':'') + '" onclick="renderHM()">'   + NAV_SVG.home    + 'Home</div>'
    + '<div class="bn' + (active==='mg'  ?' on':'') + '" onclick="renderMG()">'   + NAV_SVG.generate+ 'Generate</div>'
    + '<div class="bn' + (active==='pyq' ?' on':'') + '" onclick="renderPYQ()">'  + NAV_SVG.pyq     + 'PYQ</div>'
    + '<div class="bn' + (active==='lb'  ?' on':'') + '" onclick="go(\'lb\')">'   + NAV_SVG.ranks   + 'Ranks</div>'
    + '<div class="bn' + (active==='pf'  ?' on':'') + '" onclick="go(\'pf\')">'   + NAV_SVG.profile + 'Profile</div>'
    + '</div>';
}

