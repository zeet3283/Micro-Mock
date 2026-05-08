// ── WEAK SUBJECT DIAGNOSIS ──

var SUBJECT_COLORS = {
  'Polity':    { bar: 'linear-gradient(90deg,#6366F1,#818CF8)', bg: 'rgba(99,102,241,.1)',  border: 'rgba(99,102,241,.2)'  },
  'History':   { bar: 'linear-gradient(90deg,#F59E0B,#FCD34D)', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.2)' },
  'Geography': { bar: 'linear-gradient(90deg,#10B981,#6EE7B7)', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.2)' },
  'Economy':   { bar: 'linear-gradient(90deg,#F43F5E,#FB7185)', bg: 'rgba(244,63,94,.1)',  border: 'rgba(244,63,94,.2)'  },
  'Science':   { bar: 'linear-gradient(90deg,#22D3EE,#67E8F9)', bg: 'rgba(34,211,238,.1)', border: 'rgba(34,211,238,.2)' },
  'Current Affairs': { bar: 'linear-gradient(90deg,#8B5CF6,#C4B5FD)', bg: 'rgba(139,92,246,.1)', border: 'rgba(139,92,246,.2)' }
};

function subjectStyle(sub) {
  return SUBJECT_COLORS[sub] || { bar: 'linear-gradient(90deg,#6366F1,#22D3EE)', bg: 'rgba(99,102,241,.08)', border: 'rgba(99,102,241,.15)' };
}

// ── COMPUTE DIAGNOSIS FROM ATTEMPTS ──
function computeDiagnosis(attempts) {
  var subMap = {};
  attempts.forEach(function (a) {
    var sub = a.subject || 'General';
    if (!subMap[sub]) subMap[sub] = { total: 0, correct: 0 };
    subMap[sub].total++;
    if (parseFloat(a.accuracy_pct) >= 70) subMap[sub].correct++;
  });
  var results = Object.keys(subMap).map(function (sub) {
    var d   = subMap[sub];
    var acc = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
    return { subject: sub, accuracy: acc, attempts: d.total };
  }).filter(function (r) { return r.attempts >= 2; });
  results.sort(function (a, b) { return a.accuracy - b.accuracy; });
  return results;
}

// ── RENDER DIAGNOSIS PAGE ──
async function renderDiagnosis() {
  go('dx');
  var el = document.getElementById('dx');
  var isPro = P && (P.plan === 'pro' || (P.trial_ends_at && new Date(P.trial_ends_at) > new Date()));

  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="renderHM()" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back</button>'
    + '<div style="font-size:15px;font-weight:800">Subject Analysis</div>'
    + '<div style="width:40px"></div>'
    + '</div>'
    + '<div class="dx-body">'
    + '<div class="dx-hero">'
    + '<div class="dx-hero-t">📊 Where are you losing marks?</div>'
    + '<div class="dx-hero-s">Based on your last 60 attempts</div>'
    + '</div>'
    + '<div id="dx-content"><div class="dx-loading"><div style="font-size:13px;color:var(--t3)">Analysing your performance...</div></div></div>'
    + '</div>'
    + bnav('');

  var attempts = await api('user_attempts', '?user_id=eq.' + U.id + '&order=attempted_at.desc&limit=60');
  var dxEl = document.getElementById('dx-content');

  if (!attempts || attempts.length < 5) {
    dxEl.innerHTML =
      '<div class="dx-empty">'
      + '<div style="font-size:48px;margin-bottom:14px">📝</div>'
      + '<div style="font-size:16px;font-weight:800;margin-bottom:8px">Not enough data yet</div>'
      + '<div style="font-size:13px;color:var(--t3);line-height:1.7;max-width:260px;margin:0 auto">Complete at least 5 quizzes to unlock your subject analysis.</div>'
      + '<button class="btn btn-p" style="margin-top:20px" onclick="bQz()">Start a Quiz →</button>'
      + '</div>';
    return;
  }

  var diagnosis = computeDiagnosis(attempts);
  if (!diagnosis.length) {
    dxEl.innerHTML = '<div class="dx-empty"><div style="font-size:13px;color:var(--t3)">No subject data available yet. Keep practicing!</div></div>';
    return;
  }

  var weakest  = diagnosis.slice(0, 3);
  var strongest = diagnosis.slice().sort(function(a,b){ return b.accuracy - a.accuracy; }).slice(0,2);
  var overall  = Math.round(attempts.reduce(function(s,a){ return s + parseFloat(a.accuracy_pct||0); }, 0) / attempts.length);

  var html = '';

  // ── Overall ring ──
  html += '<div class="dx-overall">'
    + '<div class="dx-ring-wrap">'
    + '<svg width="90" height="90" viewBox="0 0 90 90">'
    + '<circle cx="45" cy="45" r="36" fill="none" stroke="var(--s2)" stroke-width="8"/>'
    + '<circle cx="45" cy="45" r="36" fill="none" stroke="url(#dxg)" stroke-width="8" stroke-linecap="round"'
    + ' stroke-dasharray="' + (2*Math.PI*36) + '" stroke-dashoffset="' + (2*Math.PI*36*(1-overall/100)) + '"'
    + ' transform="rotate(-90 45 45)"/>'
    + '<defs><linearGradient id="dxg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient></defs>'
    + '</svg>'
    + '<div class="dx-ring-label"><div class="dx-ring-val">' + overall + '%</div><div class="dx-ring-sub">Overall</div></div>'
    + '</div>'
    + '<div class="dx-overall-info">'
    + '<div class="dx-oi-t">Your Readiness Score</div>'
    + '<div class="dx-oi-s">' + attempts.length + ' quizzes · ' + diagnosis.length + ' subjects tracked</div>'
    + '<div class="dx-oi-badge ' + (overall>=70?'good':overall>=50?'mid':'low') + '">'
    + (overall>=70 ? '🟢 Strong Foundation' : overall>=50 ? '🟡 Room to Improve' : '🔴 Needs Focus') + '</div>'
    + '</div>'
    + '</div>';

  // ── All subjects bars (blurred for free) ──
  html += '<div class="dx-section-title">All Subjects</div>';
  html += '<div class="dx-bars" id="dx-bars" style="position:relative">';

  diagnosis.forEach(function (d, idx) {
    var st = subjectStyle(d.subject);
    var isLocked = !isPro && idx >= 2;
    html += '<div class="dx-bar-row' + (isLocked ? ' dx-locked-row' : '') + '">'
      + '<div class="dx-bar-top">'
      + '<div class="dx-bar-subj">' + esc(d.subject) + '</div>'
      + '<div class="dx-bar-acc" style="color:' + (d.accuracy>=70?'#6EE7B7':d.accuracy>=50?'#FCD34D':'#FDA4AF') + '">'
      + (isLocked ? '??%' : d.accuracy + '%') + '</div>'
      + '</div>'
      + '<div class="dx-bar-bg">'
      + '<div class="dx-bar-fg" style="width:' + (isLocked?'0':d.accuracy) + '%;background:' + st.bar + ';transition:width 1s ease ' + (idx*0.1) + 's"></div>'
      + '</div>'
      + '<div class="dx-bar-meta">' + d.attempts + ' questions attempted</div>'
      + '</div>';
  });

  if (!isPro && diagnosis.length > 2) {
    html += '<div class="dx-paywall">'
      + '<div class="dx-pw-icon">🔒</div>'
      + '<div class="dx-pw-t">Full Analysis is a Pro Feature</div>'
      + '<div class="dx-pw-s">You have ' + (diagnosis.length - 2) + ' more subjects hidden. See exactly where you\'re losing marks and what to fix first.</div>'
      + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')" style="margin-top:4px">Unlock Full Diagnosis — ₹149/month</button>'
      + '</div>';
  }

  html += '</div>';

  // ── Weakest subjects (Pro only detailed tips) ──
  if (isPro && weakest.length) {
    html += '<div class="dx-section-title" style="margin-top:20px">⚠️ Focus Here First</div>';
    weakest.forEach(function (d) {
      var st = subjectStyle(d.subject);
      html += '<div class="dx-focus-card" style="background:' + st.bg + ';border-color:' + st.border + '">'
        + '<div class="dx-fc-top">'
        + '<div class="dx-fc-subj">' + esc(d.subject) + '</div>'
        + '<div class="dx-fc-acc">' + d.accuracy + '% accuracy</div>'
        + '</div>'
        + '<div class="dx-fc-tip">Practice more ' + esc(d.subject) + ' questions to build confidence in this area.</div>'
        + '<button class="dx-fc-btn" onclick="bQz()">Practice Now →</button>'
        + '</div>';
    });
  }

  // ── Strongest subjects ──
  if (strongest.length) {
    html += '<div class="dx-section-title" style="margin-top:20px">💪 Your Strengths</div>'
      + '<div class="dx-strengths">';
    strongest.forEach(function (d) {
      var st = subjectStyle(d.subject);
      html += '<div class="dx-strength-chip" style="background:' + st.bg + ';border-color:' + st.border + '">'
        + esc(d.subject) + ' · ' + d.accuracy + '%</div>';
    });
    html += '</div>';
  }

  dxEl.innerHTML = html;

  // Animate bars after render
  setTimeout(function () {
    document.querySelectorAll('.dx-bar-fg').forEach(function (b) {
      var w = b.style.width; b.style.width = '0'; 
      setTimeout(function(){ b.style.width = w; }, 50);
    });
  }, 100);
}
