// ── STATE ──
var U = null, P = null;

// ── INIT ──
async function init() {
  try {
    var code = new URLSearchParams(location.search).get('code');
    if (code) {
      history.replaceState(null, '', location.pathname);
      var verifier = sessionStorage.getItem('pkce_verifier') || localStorage.getItem('pkce_verifier');
      sessionStorage.removeItem('pkce_verifier');
      localStorage.removeItem('pkce_verifier');
      var pkceRes  = await fetch(SB + '/auth/v1/token?grant_type=pkce', {
        method: 'POST', headers: getH(),
        body: JSON.stringify({ auth_code: code, code_verifier: verifier })
      });
      var pkceData = await pkceRes.json();
      if (pkceData.access_token) { localStorage.setItem('mm_tk', pkceData.access_token); }
      else { go('lg'); return; }
    }
    var hash = location.hash;
    if (hash && hash.includes('access_token')) {
      var params = new URLSearchParams(hash.slice(1));
      var tk = params.get('access_token');
      if (tk) { localStorage.setItem('mm_tk', tk); history.replaceState(null, '', location.pathname); }
    }
    var token = localStorage.getItem('mm_tk');
    if (!token) {
      var seen = localStorage.getItem('mm_seen');
      if (seen) { go('lg'); } else { localStorage.setItem('mm_seen', '1'); go('on'); }
      return;
    }
    var ctrl = new AbortController();
    var tid  = setTimeout(function () { ctrl.abort(); }, 6000);
    var res  = await fetch(SB + '/auth/v1/user', { headers: getH(), signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) { localStorage.removeItem('mm_tk'); go('lg'); return; }
    U = await res.json();
    var profileArr = await api('users', '?id=eq.' + U.id + '&limit=1');
    if (profileArr && profileArr.length > 0) {
      P = profileArr[0];
      if (!P.name || P.name.trim() === '') { go('ob'); return; }
      await renderHM();
    } else { go('ob'); }
  } catch (err) {
    console.error('Init failed:', err.name, err.message);
    localStorage.removeItem('mm_tk'); go('lg');
  }
}

// ── ONBOARDING ──
var obIdx = 0;
function obGoNext() {
  obIdx++;
  if (obIdx >= 3) { obSkip(); return; }
  var slides = document.getElementById('ob-slides');
  if (slides) slides.style.transform = 'translateX(-' + (obIdx * 33.333) + '%)';
  document.querySelectorAll('.ob-d').forEach(function (d, i) { d.classList.toggle('on', i === obIdx); });
  var btn = document.getElementById('ob-next-btn');
  if (btn) btn.textContent = obIdx === 2 ? 'Get Started →' : 'Next →';
}
function obSkip() { go('lg'); }

// ── LOGIN ──
function stab(t) {
  document.querySelectorAll('.atab').forEach(function (tab, i) { tab.classList.toggle('on', ['social','email'][i] === t); });
  document.querySelectorAll('.aform').forEach(function (f) { f.classList.remove('on'); });
  document.getElementById('tab-' + t).classList.add('on');
}

function signGoogle() {
  var array = new Uint8Array(32);
  crypto.getRandomValues(array);
  var verifier = btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  localStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('pkce_verifier', verifier);
  var encoder = new TextEncoder();
  crypto.subtle.digest('SHA-256', encoder.encode(verifier)).then(function (buf) {
    var challenge = btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
      .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
    var redirectTo = location.href.split('#')[0].split('?')[0];
    location.href = SB + '/auth/v1/authorize?provider=google&redirect_to='
      + encodeURIComponent(redirectTo)
      + '&code_challenge=' + challenge + '&code_challenge_method=s256';
  });
}

async function signEmail() {
  var em = document.getElementById('em-inp').value.trim();
  var pw = document.getElementById('pw-inp').value;
  if (!em || !pw) { toast('Enter email and password', 'err'); return; }
  toast('Signing in...');
  try {
    var r = await fetch(SB + '/auth/v1/token?grant_type=password', {
      method: 'POST', headers: getH(), body: JSON.stringify({ email: em, password: pw })
    });
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
    var r = await fetch(SB + '/auth/v1/signup', {
      method: 'POST', headers: getH(), body: JSON.stringify({ email: em, password: pw })
    });
    var d = await r.json();
    if (d.access_token) { localStorage.setItem('mm_tk', d.access_token); init(); }
    else if (d.id) toast('Check your email for a confirmation link!', 'ok');
    else toast(d.msg || 'Error. Try Google instead.', 'err');
  } catch (e) { toast('Error. Try Google.', 'err'); }
}

function logout() { localStorage.removeItem('mm_tk'); U = null; P = null; go('lg'); }

// ── EXAM SELECTION ──
var EX = null;
function pEx(el, ex) {
  document.querySelectorAll('.exam-card').forEach(function (e) { e.classList.remove('sel'); });
  el.classList.add('sel'); EX = ex;
}

// ── ONBOARD SUBMIT ──
async function fOb() {
  var nm = document.getElementById('obn').value.trim();
  if (!nm)         { toast('Enter your name', 'err'); return; }
  if (nm.length > 50) { toast('Name must be 50 characters or less', 'err'); return; }
  if (!EX)         { toast('Select your exam', 'err'); return; }
  var trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    await fetch(SB + '/rest/v1/users', {
      method: 'POST',
      headers: getH({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        id: U.id, email: U.email, name: nm, exam_target: EX,
        plan: 'free', trial_ends_at: trialEnd, xp: 0, level: 1,
        streak_shields: 2, current_streak: 0,
        ai_questions_bank: 3, ai_bank_last_reset: new Date().toISOString().split('T')[0]
      })
    });
  } catch (e) {}
  P = {
    id: U.id, email: U.email, name: nm, exam_target: EX,
    plan: 'free', xp: 0, level: 1, trial_ends_at: trialEnd,
    streak_shields: 2, current_streak: 0,
    ai_questions_bank: 3, ai_bank_last_reset: new Date().toISOString().split('T')[0]
  };
  toast('Welcome, ' + nm + '! 7-day Pro trial is active 🎉', 'ok');
  await renderHM(); go('hm');
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

// ── THEME ──
function initTheme() {
  if (localStorage.getItem('mm_theme') === 'light') document.body.classList.add('light');
}
function toggleTheme() {
  var isLight = document.body.classList.toggle('light');
  localStorage.setItem('mm_theme', isLight ? 'light' : 'dark');
  document.querySelectorAll('.theme-toggle').forEach(function (t) { t.classList.toggle('on', isLight); });
}
