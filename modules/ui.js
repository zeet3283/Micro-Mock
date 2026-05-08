// ── HOME ──
async function renderHM() {
  go('hm');
  var el         = document.getElementById('hm');
  var nm         = (P && P.name) || 'Aspirant';
  var seed       = U ? U.id : nm;
  var q          = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  var xp         = P && P.xp ? parseInt(P.xp) : 0;
  var shields    = (P && P.streak_shields !== undefined) ? parseInt(P.streak_shields) : 2;
  var initStreak = (P && P.current_streak) ? parseInt(P.current_streak) : 0;
  var sColor     = shields === 0 ? '#FDA4AF' : shields <= 1 ? '#FCD34D' : '#6EE7B7';
  var sBg        = shields === 0 ? 'rgba(244,63,94,.08)'  : shields <= 1 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)';
  var sBorder    = shields === 0 ? 'rgba(244,63,94,.25)'  : shields <= 1 ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)';

  var trialHTML = '';
  if (P && P.trial_ends_at) {
    var diff = Math.ceil((new Date(P.trial_ends_at) - new Date()) / (1000*60*60*24));
    if (diff > 0 && diff <= 7) {
      trialHTML = '<div class="trial-banner">'
        + '<div class="tb-ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg></div>'
        + '<div style="flex:1"><div class="tb-days">' + esc(String(diff)) + '</div><div class="tb-label">days of Pro trial remaining</div></div>'
        + '<button class="tb-btn" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Upgrade</button>'
        + '</div>';
    }
  }

  el.innerHTML =
    '<div class="nav">'
    + '<div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div>'
    + '<div class="nav-right"><div class="user-av" onclick="go(\'pf\')"><img src="' + avUrl(seed) + '" alt=""/></div></div>'
    + '</div>'
    + '<div class="hbody">'
    + '<div class="greet">'
    + '<div><div class="greet-sub">Good to see you 👋</div><div class="greet-name">' + esc(nm) + '</div></div>'
    + '<div class="greet-chips">'
    + '<div class="streak-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="#FCD34D"><path d="M12 2c0 0-6 6-6 12a6 6 0 0 0 12 0c0-6-6-12-6-12z"/></svg><span id="hst">' + initStreak + '</span> days</div>'
    + '<div class="shield-chip" id="shield-chip" onclick="showShieldInfo()" style="background:' + sBg + ';border-color:' + sBorder + ';color:' + sColor + '">🛡️ <span id="h-shields">' + shields + '</span></div>'
    + '</div>'
    + '</div>'
    + trialHTML
    + '<div class="xp-bar-wrap">'
    + '<div class="xp-top"><div class="level-badge"><span id="level-icon">⚡</span><span class="level-name" id="level-nm">Rookie</span></div>'
    + '<span class="xp-count" id="xp-count">' + esc(String(xp)) + ' / 100 XP</span></div>'
    + '<div class="xp-track"><div class="xp-fill" id="xp-fill" style="width:0%"></div></div>'
    + '</div>'
    + '<div class="qhero"><div class="qhero-orb1"></div><div class="qhero-orb2"></div>'
    + '<div class="live-tag"><div class="live-dot"></div><div class="live-label">Live Now</div></div>'
    + '<div class="qhero-t" id="htl">Daily MCQ Challenge</div>'
    + '<div class="qhero-pills"><span class="pill" id="hpill">' + esc((P && P.exam_target) || 'UPSC') + '</span><span class="pill">10 Questions</span><span class="pill">10 Min</span></div>'
    + '<button class="btn btn-p" id="bsq" onclick="bQz()" style="position:relative;z-index:1">Start Today\'s Quiz →</button>'
    + '</div>'
    + '<div class="stats-grid">'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#6366F1,#22D3EE);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent" id="hac">--</div><div class="stat-lbl">Accuracy</div></div>'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#10B981,#22D3EE);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent" id="hqz">--</div><div class="stat-lbl">Quizzes</div></div>'
    + '<div class="stat-box"><div class="stat-val" style="background:linear-gradient(135deg,#F59E0B,#F97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent" id="hxp">' + esc(String(xp)) + '</div><div class="stat-lbl">XP</div></div>'
    + '</div>'
    + '<div style="font-size:15px;font-weight:800;margin-bottom:12px">Quick Practice</div>'
    + '<div class="quick-actions-grid">'
    + '<div class="qa-card" onclick="renderPYQ()" style="background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(99,102,241,.05));border-color:rgba(99,102,241,.25)"><div class="qa-icon" style="background:rgba(99,102,241,.15)">📋</div><div class="qa-nm">PYQ Practice</div><div class="qa-info">Real past papers</div></div>'
    + '<div class="qa-card" onclick="renderMG()" style="background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.04));border-color:rgba(16,185,129,.2)"><div class="qa-icon" style="background:rgba(16,185,129,.15)">⚡</div><div class="qa-nm">AI Generator</div><div class="qa-info">From your notes</div></div>'
    + '<div class="qa-card" onclick="renderDiagnosis()" style="background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04));border-color:rgba(245,158,11,.2)"><div class="qa-icon" style="background:rgba(245,158,11,.15)">📊</div><div class="qa-nm">My Analysis</div><div class="qa-info">Weak subject finder</div></div>'
    + '<div class="qa-card" onclick="go(\'lb\')" style="background:linear-gradient(135deg,rgba(34,211,238,.1),rgba(34,211,238,.04));border-color:rgba(34,211,238,.2)"><div class="qa-icon" style="background:rgba(34,211,238,.12)">🏆</div><div class="qa-nm">Leaderboard</div><div class="qa-info">Today\'s rankings</div></div>'
    + '</div>'
    + '<div class="quote"><div class="q-tag">Daily Fuel</div><div class="q-txt">"' + esc(q[0]) + '"</div><div class="q-by">— ' + esc(q[1]) + '</div></div>'
    + '</div>'
    + bnav('hm');

  document.getElementById('ai-fab').style.display = 'flex';
  updLvlUI(xp);
  refreshAiBank().then(updateAiCount);

  api('user_attempts', '?user_id=eq.' + U.id + '&order=attempted_at.desc&limit=60').then(function (at) {
    if (!at || !at.length) return;
    var avg = at.reduce(function (s, a) { return s + parseFloat(a.accuracy_pct || 0); }, 0) / at.length;
    var hac = document.getElementById('hac'); if (hac) hac.textContent = Math.round(avg) + '%';
    var hqz = document.getElementById('hqz'); if (hqz) hqz.textContent = at.length;
  });

  api('quizzes', '?scheduled_for=eq.' + new Date().toISOString().split('T')[0] + '&is_published=eq.true&limit=1').then(function (qz) {
    if (!qz || !qz.length) return;
    var htl = document.getElementById('htl'); if (htl) htl.textContent = qz[0].title;
    var hp  = document.getElementById('hpill'); if (hp) hp.textContent = qz[0].exam_target;
  });

  setTimeout(checkStreakHealth, 300);
}

// ── LEADERBOARD ──
async function renderLB() {
  var el   = document.getElementById('lb');
  var seed = U ? U.id : 'user';
  el.innerHTML =
    '<div class="nav">'
    + '<div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div>'
    + '<div class="user-av" onclick="go(\'pf\')"><img src="' + avUrl(seed) + '" alt=""/></div>'
    + '</div>'
    + '<div class="lbody">'
    + '<div style="margin-bottom:16px"><div class="h2" style="margin-bottom:4px">Leaderboard</div><div class="body">Today\'s top performers</div></div>'
    + '<div class="my-rank-box" id="my-rank-box" style="display:none">'
    + '<div style="font-size:12px;color:var(--t3);margin-bottom:4px">Your Position Today</div>'
    + '<div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#6366F1,#22D3EE);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent" id="my-rank-n">#--</div>'
    + '</div>'
    + '<div class="podium" id="podium" style="display:none"></div>'
    + '<div class="lb-list" id="lbl"><div style="text-align:center;padding:40px;color:var(--t3)">Loading...</div></div>'
    + '</div>'
    + bnav('lb');

  var data = await api('daily_leaderboard', '?limit=20&order=rank.asc');
  var list = document.getElementById('lbl');
  var pod  = document.getElementById('podium');

  if (!data || !data.length) {
    if (pod) pod.style.display = 'none';
    if (list) list.innerHTML =
      '<div style="text-align:center;padding:56px 16px">'
      + '<div style="font-size:40px;margin-bottom:14px">🏆</div>'
      + '<div style="font-size:17px;font-weight:800;margin-bottom:6px">No one yet today</div>'
      + '<div style="font-size:13px;color:var(--t3)">Be the first to complete today\'s quiz!</div>'
      + '<button class="btn btn-p" style="margin-top:16px;max-width:200px" onclick="renderHM()">Start Quiz →</button>'
      + '</div>';
    return;
  }

  if (U) {
    var me = data.find(function (d) { return d.id === U.id; });
    if (me) {
      var mrb = document.getElementById('my-rank-box'); if (mrb) mrb.style.display = 'block';
      var mrn = document.getElementById('my-rank-n');   if (mrn) mrn.textContent = '#' + me.rank;
    }
  }

  var top3 = data.slice(0, Math.min(3, data.length));
  if (top3.length >= 3 && pod) {
    pod.style.display = 'flex';
    var order  = [top3[1], top3[0], top3[2]];
    var cls    = ['pod2','pod1','pod3'];
    var medals = ['🥈','🥇','🥉'];
    var ht     = ['68px','86px','54px'];
    pod.innerHTML = order.map(function (it, i) {
      return '<div class="pod ' + cls[i] + '"><div style="font-size:20px">' + medals[i] + '</div>'
        + '<div class="pod-av" style="' + (i===1?'border:2px solid #F59E0B':i===0?'border:2px solid #94A3B8':'border:2px solid #CD7F32') + '">'
        + '<img src="' + avUrl(it.id||it.name) + '" alt=""/></div>'
        + '<div class="pod-nm">' + esc(it.name||'Aspirant') + '</div>'
        + '<div class="pod-sc">' + esc(String(it.score)) + '/10</div>'
        + '<div class="pod-stand" style="height:' + ht[i] + '">' + (i===1?'1':i===0?'2':'3') + '</div></div>';
    }).join('');
  } else if (pod) pod.style.display = 'none';

  if (list) {
    list.innerHTML = data.slice(top3.length >= 3 ? 3 : 0).map(function (it) {
      var isMe = U && it.id === U.id;
      return '<div class="lb-row' + (isMe?' me':'') + '">'
        + '<div class="lb-rk">#' + esc(String(it.rank)) + '</div>'
        + '<div class="lb-av"><img src="' + avUrl(it.id||it.name) + '" alt=""/></div>'
        + '<div class="lb-info"><div class="lb-nm">' + esc(it.name||'Aspirant') + (isMe?' · You':'') + '</div><div class="lb-ex">' + esc(it.exam_target||'UPSC') + '</div></div>'
        + '<div class="lb-right"><div class="lb-sc">' + esc(String(it.score)) + '/10</div><div class="lb-acc">' + esc(String(it.accuracy_pct||0)) + '%</div></div>'
        + '</div>';
    }).join('');
  }
}

// ── PYQ ──
async function renderPYQ() {
  go('pyq');
  var el = document.getElementById('pyq');
  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="renderHM()" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back</button>'
    + '<div style="font-size:15px;font-weight:800">Previous Year Questions</div>'
    + '<div style="width:40px"></div>'
    + '</div>'
    + '<div class="pyq-body">'
    + '<div class="pyq-hero"><div class="pyq-hero-t">📚 PYQ Practice</div><div class="pyq-hero-s">Practice real questions from past exams</div></div>'
    + '<div class="pyq-exam-tabs" id="pyq-exam-tabs">'
    + PYQ_EXAMS.map(function (e) {
      return '<button class="pyq-exam-tab' + (e.id===pyqExam?' on':'') + '" onclick="selectPYQExam(\'' + e.id + '\')">' + e.icon + ' ' + esc(e.label) + '</button>';
    }).join('')
    + '</div>'
    + '<div id="pyq-sets-wrap"><div class="pyq-loading"><div style="font-size:13px;color:var(--t3)">Loading...</div></div></div>'
    + '</div>'
    + bnav('pyq');
  loadPYQSets(pyqExam);
}

async function selectPYQExam(exam) {
  pyqExam = exam;
  document.querySelectorAll('.pyq-exam-tab').forEach(function (b) {
    b.classList.toggle('on', b.textContent.trim().includes(PYQ_EXAMS.find(function (e) { return e.id === exam; }).label));
  });
  loadPYQSets(exam);
}

async function loadPYQSets(exam) {
  var wrap = document.getElementById('pyq-sets-wrap'); if (!wrap) return;
  wrap.innerHTML = '<div class="pyq-loading"><div style="font-size:13px;color:var(--t3)">Loading...</div></div>';
  var data = await api('questions', '?source_tag=eq.pyq&pyq_exam=eq.' + exam + '&select=year,pyq_exam&order=year.desc');
  if (!data || !data.length) {
    wrap.innerHTML =
      '<div class="pyq-empty">'
      + '<div style="font-size:48px;margin-bottom:14px">📭</div>'
      + '<div style="font-size:16px;font-weight:800;margin-bottom:8px">No PYQs yet for ' + esc(exam) + '</div>'
      + '<div style="font-size:13px;color:var(--t3);line-height:1.7;max-width:260px;margin:0 auto">Real previous year questions will appear here once uploaded.</div>'
      + '</div>';
    return;
  }
  var years = {};
  data.forEach(function (q) { var yr = q.year||'Unknown'; if (!years[yr]) years[yr]=0; years[yr]++; });
  var html = '<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--t3);margin-bottom:12px">Select Year</div><div class="pyq-sets-list">';
  Object.keys(years).sort(function (a,b) { return b-a; }).forEach(function (yr) {
    html += '<div class="pyq-set-card" onclick="startPYQQuiz(\'' + esc(exam) + '\',' + parseInt(yr) + ')">'
      + '<div class="pyq-set-icon">📋</div>'
      + '<div class="pyq-set-info"><div class="pyq-set-title">' + esc(exam) + ' ' + esc(String(yr)) + '</div><div class="pyq-set-meta">' + esc(String(years[yr])) + ' questions</div></div>'
      + '<div class="pyq-set-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></div>'
      + '</div>';
  });
  wrap.innerHTML = html + '</div></div>';
}

// ── PROFILE ──
async function renderPF() {
  var seed = U ? U.id : 'user';
  var el   = document.getElementById('pf');
  var xp   = P && P.xp ? parseInt(P.xp) : 0;
  var lvl  = getLvl(xp);
  var shields    = P ? (parseInt(P.streak_shields)||0) : 0;
  var isPro      = P && (P.plan==='pro' || (P.trial_ends_at && new Date(P.trial_ends_at)>new Date()));
  var trialBadge = '';
  if (P && P.trial_ends_at) {
    var diff = Math.ceil((new Date(P.trial_ends_at)-new Date())/(1000*60*60*24));
    if (diff > 0) trialBadge = '<div class="badge trial">⏳ ' + esc(String(diff)) + ' day trial</div>';
  }

  el.innerHTML =
    '<div class="nav"><div class="nav-logo">' + LOGO_SVG + '<div class="nav-logo-text">Micro <span>Mock</span></div></div></div>'
    + '<div class="pbody">'
    // ── Hero ──
    + '<div class="pf-hero"><div class="pf-glow"></div>'
    + '<div class="pf-av"><img src="' + avUrl(seed) + '" alt=""/></div>'
    + '<div class="pf-nm">' + esc((P&&P.name)||'Aspirant') + '</div>'
    + '<div class="pf-em">' + esc(U&&U.email?U.email:'') + '</div>'
    + '<div class="pf-badges">'
    + '<div class="badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="#A5B4FC"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>' + (isPro?'Pro':'Free') + ' Plan</div>'
    + trialBadge
    + '<div class="badge level">' + esc(lvl.i) + ' ' + esc(lvl.n) + '</div>'
    + '</div></div>'
    // ── Shield status ──
    + '<div class="pf-shield-row">'
    + '<div class="pf-shield-left"><div style="font-size:22px">🛡️</div>'
    + '<div><div style="font-size:14px;font-weight:800">Streak Shields</div>'
    + '<div style="font-size:12px;color:var(--t3);margin-top:2px">' + (isPro?'4 per month — auto-replenished':'Free users get 2 shields to start') + '</div></div></div>'
    + '<div class="pf-shield-count ' + (shields===0?'empty':shields<=1?'low':'good') + '">' + shields + '</div>'
    + '</div>'
    // ── Prep Report button ──
    + '<div class="pf-report-btn" onclick="renderReport()">'
    + '<div style="display:flex;align-items:center;gap:12px">'
    + '<div style="width:42px;height:42px;border-radius:12px;background:rgba(99,102,241,.12);display:flex;align-items:center;justify-content:center;font-size:20px">📊</div>'
    + '<div><div style="font-size:14px;font-weight:800">Weekly Prep Report</div>'
    + '<div style="font-size:12px;color:var(--t3);margin-top:2px">' + (isPro?'View your latest report':'Pro feature — unlock now') + '</div>'
    + '</div></div>'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
    + '</div>'
    // ── Diagnosis shortcut ──
    + '<div class="pf-report-btn" onclick="renderDiagnosis()" style="margin-top:0">'
    + '<div style="display:flex;align-items:center;gap:12px">'
    + '<div style="width:42px;height:42px;border-radius:12px;background:rgba(245,158,11,.12);display:flex;align-items:center;justify-content:center;font-size:20px">🔬</div>'
    + '<div><div style="font-size:14px;font-weight:800">Subject Analysis</div>'
    + '<div style="font-size:12px;color:var(--t3);margin-top:2px">See your weak subjects</div>'
    + '</div></div>'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
    + '</div>'
    // ── Upgrade card ──
    + '<div class="up-card">'
    + '<div class="up-t">Upgrade to Pro</div>'
    + '<div class="up-s">Most UPSC qualifiers practiced 100+ questions per week. Pro removes every limit standing between you and that number.</div>'
    + '<div class="up-feats">'
    + '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>4 Streak Shields per month</div>'
    + '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Full Subject Diagnosis</div>'
    + '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Weekly Prep Report</div>'
    + '<div class="uf"><div class="uf-ck"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>Unlimited AI questions</div>'
    + '</div>'
    + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')" style="font-size:16px;padding:17px;margin-bottom:10px">Upgrade Now — ₹149/month →</button>'
    + '</div>'
    // ── Theme ──
    + '<div class="theme-row">'
    + '<div class="theme-row-left"><span style="font-size:18px">' + (document.body.classList.contains('light')?'☀️':'🌙') + '</span>'
    + '<div><div style="font-size:14px;font-weight:700">' + (document.body.classList.contains('light')?'Light Mode':'Dark Mode') + '</div>'
    + '<div style="font-size:11px;color:var(--t3);margin-top:1px">Tap to switch</div></div></div>'
    + '<button class="theme-toggle' + (document.body.classList.contains('light')?' on':'') + '" onclick="toggleTheme();renderPF()"></button>'
    + '</div>'
    + '<button class="btn" style="background:rgba(244,63,94,.06);border:1px solid rgba(244,63,94,.18);color:#FDA4AF;margin-top:4px" onclick="logout()">Sign Out</button>'
    + '<div style="text-align:center;padding:12px 0 4px"><a href="privacy.html" style="font-size:12px;color:var(--t3);text-decoration:none">Privacy Policy & Terms</a></div>'
    // ── Gen history ──
    + '<div class="gen-hist-section" style="margin-top:18px">'
    + '<div class="gen-hist-hdr"><div class="gen-hist-title">⚡ Generated Quiz History</div>'
    + '<button class="btn-sm btn-g" onclick="renderMG()" style="font-size:11px;padding:6px 12px;width:auto">+ New</button></div>'
    + '<div class="gen-hist-list" id="gen-hist-list"><div style="text-align:center;padding:20px;color:var(--t3);font-size:13px">Loading...</div></div>'
    + '</div>'
    + '</div>'
    + bnav('pf');

  // ── Load stats async ──
  api('user_attempts', '?user_id=eq.' + U.id).then(function (at) {
    if (!at || !at.length) return;
    var avg = at.reduce(function (s,a) { return s+parseFloat(a.accuracy_pct||0); },0) / at.length;
    var ar  = Math.round(avg);
    var pd  = document.getElementById('pd'); if (pd) pd.textContent = at.length;
    var pa  = document.getElementById('pa'); if (pa) pa.textContent = ar + '%';
    var pq  = document.getElementById('pq'); if (pq) pq.textContent = at.length;
  });

  api('user_attempts', '?user_id=eq.' + U.id + '&is_generated=eq.true&order=created_at.desc&limit=10').then(function (hist) {
    var histEl = document.getElementById('gen-hist-list'); if (!histEl) return;
    if (!hist || !hist.length) {
      histEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:13px">No generated quizzes yet.<br/>Tap + New to try the MCQ Generator!</div>';
      return;
    }
    histEl.innerHTML = hist.map(function (a) {
      var date    = new Date(a.created_at);
      var dateStr = date.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
      var emoji   = a.accuracy_pct>=70 ? '🏆' : a.accuracy_pct>=50 ? '📈' : '📚';
      return '<div class="gen-hist-card">'
        + '<div class="gen-hist-icon">' + emoji + '</div>'
        + '<div class="gen-hist-info"><div class="gen-hist-name">Generated Quiz</div>'
        + '<div class="gen-hist-meta">' + esc(dateStr) + ' · ' + esc(String(a.total_questions)) + ' Qs · ' + esc(String(a.time_taken_sec)) + 's</div></div>'
        + '<div class="gen-hist-score"><div class="gen-hist-val">' + esc(String(a.score)) + '/' + esc(String(a.total_questions)) + '</div>'
        + '<div class="gen-hist-lbl">' + Math.round(a.accuracy_pct) + '%</div></div>'
        + '</div>';
    }).join('');
  });
}
