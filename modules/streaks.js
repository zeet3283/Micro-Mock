// ── STREAK SHIELD SYSTEM ──

async function checkStreakHealth() {
  if (!U || !P) return;
  var shields    = parseInt(P.streak_shields)  || 0;
  var streak     = parseInt(P.current_streak)  || 0;
  var lastQuiz   = P.last_quiz_date;
  if (!lastQuiz || streak === 0) return;

  var today      = new Date(); today.setHours(0,0,0,0);
  var todayStr   = today.toISOString().split('T')[0];
  var yesterday  = new Date(today); yesterday.setDate(today.getDate()-1);
  var yestStr    = yesterday.toISOString().split('T')[0];
  var twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate()-2);
  var twoDayStr  = twoDaysAgo.toISOString().split('T')[0];

  // CASE 1: Missed yesterday — shield saves or streak breaks
  if (lastQuiz === twoDayStr && streak >= 2) {
    if (shields > 0) {
      var newShields = shields - 1;
      await patch('users', '?id=eq.' + U.id, { streak_shields: newShields });
      P.streak_shields = newShields;
      updateShieldUI(newShields);
      showShieldUsedBanner(streak, newShields);
    } else {
      var broken = streak;
      await patch('users', '?id=eq.' + U.id, { current_streak: 0 });
      P.current_streak = 0;
      updateStreakUI(0);
      setTimeout(function () { showStreakBrokenModal(broken); }, 700);
    }
    return;
  }

  // CASE 2: Streak at risk — played yesterday, not yet today
  if (lastQuiz === yestStr && streak >= 3 && lastQuiz !== todayStr) {
    showStreakRiskBanner(streak, shields);
  }

  // CASE 3: Day 4 or 5 milestone — paywall shown once ever
  if ((streak === 4 || streak === 5) && !P.shield_promo_seen && P.plan !== 'pro') {
    await patch('users', '?id=eq.' + U.id, { shield_promo_seen: true });
    P.shield_promo_seen = true;
    setTimeout(function () { showStreakPromoModal(streak); }, 1500);
  }
}

// ── SHIELD USED BANNER ──
function showShieldUsedBanner(streak, shieldsLeft) {
  var hbody = document.querySelector('.hbody'); if (!hbody) return;
  var div = document.createElement('div');
  div.className = 'shield-used-banner';
  div.innerHTML =
    '<div class="sub-left"><span class="sub-icon">🛡️</span>'
    + '<div><div class="sub-t">Shield Used — Streak Saved!</div>'
    + '<div class="sub-s">Your ' + streak + '-day streak is safe. ' + shieldsLeft + ' shield' + (shieldsLeft !== 1 ? 's' : '') + ' remaining.</div>'
    + '</div></div>'
    + (shieldsLeft === 0 ? '<button class="sub-btn" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Get Pro ↗</button>' : '');
  hbody.insertBefore(div, hbody.firstChild);
  setTimeout(function () {
    div.style.opacity = '0'; div.style.maxHeight = '0';
    setTimeout(function () { if (div.parentNode) div.remove(); }, 450);
  }, 6000);
}

// ── STREAK RISK BANNER ──
function showStreakRiskBanner(streak, shields) {
  if (document.getElementById('streak-risk-banner')) return;
  var hbody = document.querySelector('.hbody'); if (!hbody) return;
  var div = document.createElement('div');
  div.id = 'streak-risk-banner'; div.className = 'streak-risk-banner';
  div.innerHTML =
    '<div class="srb-left"><span style="font-size:22px">⚠️</span>'
    + '<div><div class="srb-t">Your ' + streak + '-day streak is at risk!</div>'
    + '<div class="srb-s">Play today · ' + shields + ' 🛡️ shield' + (shields !== 1 ? 's' : '') + ' remaining</div>'
    + '</div></div>'
    + '<button class="srb-btn" onclick="bQz()">Play Now</button>';
  var greet = hbody.querySelector('.greet');
  if (greet && greet.nextSibling) hbody.insertBefore(div, greet.nextSibling);
  else hbody.insertBefore(div, hbody.firstChild);
}

// ── STREAK BROKEN MODAL ──
function showStreakBrokenModal(oldStreak) {
  var m = document.createElement('div');
  m.className = 'streak-modal-overlay';
  m.innerHTML =
    '<div class="streak-modal"><div class="sm-orb"></div>'
    + '<div class="sm-emoji">💔</div>'
    + '<div class="sm-title">Your ' + oldStreak + '-day streak is gone</div>'
    + '<div class="sm-sub">You missed yesterday with no shields left. Pro members never lose their streaks — 4 shields automatically replenish every month.</div>'
    + '<div class="sm-shields-row">'
    + '<div class="sm-shield broken">🛡️</div><div class="sm-shield broken">🛡️</div>'
    + '<div class="sm-shield broken">🛡️</div><div class="sm-shield broken">🛡️</div>'
    + '</div>'
    + '<div class="sm-shields-lbl">4 Shields/month with Pro — auto-replenished</div>'
    + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\');closeStreakModal()" style="margin-bottom:0">'
    + 'Protect future streaks — ₹149/month</button>'
    + '<button class="sm-skip" onclick="closeStreakModal()">Start a fresh streak instead</button>'
    + '</div>';
  m.addEventListener('click', function (e) { if (e.target === m) closeStreakModal(); });
  document.body.appendChild(m);
  requestAnimationFrame(function () { m.classList.add('on'); });
}

// ── STREAK PROMO MODAL ──
function showStreakPromoModal(streak) {
  var m = document.createElement('div');
  m.className = 'streak-modal-overlay';
  m.innerHTML =
    '<div class="streak-modal"><div class="sm-orb promo"></div>'
    + '<div class="sm-emoji">🔥</div>'
    + '<div class="sm-title">Your ' + streak + '-day streak is your best yet</div>'
    + '<div class="sm-sub">Aspirants with 7+ day streaks score 23% higher in mock tests. One missed day and it\'s gone — unless you\'re protected.</div>'
    + '<div class="sm-shields-row">'
    + '<div class="sm-shield active">🛡️</div><div class="sm-shield active">🛡️</div>'
    + '<div class="sm-shield active">🛡️</div><div class="sm-shield active">🛡️</div>'
    + '</div>'
    + '<div class="sm-shields-lbl">4 Streak Shields every month with Pro</div>'
    + '<button class="btn btn-trial" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\');closeStreakModal()" style="margin-bottom:0">'
    + 'Protect my streak — ₹149/month</button>'
    + '<button class="sm-skip" onclick="closeStreakModal()">I\'ll risk it</button>'
    + '</div>';
  m.addEventListener('click', function (e) { if (e.target === m) closeStreakModal(); });
  document.body.appendChild(m);
  requestAnimationFrame(function () { m.classList.add('on'); });
}

function closeStreakModal() {
  var m = document.querySelector('.streak-modal-overlay'); if (!m) return;
  m.classList.remove('on');
  setTimeout(function () { if (m.parentNode) m.remove(); }, 350);
}

// ── UI UPDATES ──
function updateShieldUI(shields) {
  var el = document.getElementById('h-shields'); if (el) el.textContent = shields;
  var chip = document.getElementById('shield-chip'); if (!chip) return;
  var color  = shields === 0 ? '#FDA4AF' : shields <= 1 ? '#FCD34D' : '#6EE7B7';
  var bg     = shields === 0 ? 'rgba(244,63,94,.08)'  : shields <= 1 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)';
  var border = shields === 0 ? 'rgba(244,63,94,.25)'  : shields <= 1 ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)';
  chip.style.color = color; chip.style.background = bg; chip.style.borderColor = border;
}

function updateStreakUI(streak) {
  var el = document.getElementById('hst'); if (el) el.textContent = streak;
}

function showShieldInfo() {
  var shields = P ? parseInt(P.streak_shields) || 0 : 0;
  if (P && P.plan === 'pro') {
    toast('🛡️ Pro: ' + shields + ' shields this month — replenish on billing date.', 'ok');
  } else if (shields === 0) {
    toast('No shields left! Pro gives 4 shields/month 🛡️', 'err');
    setTimeout(function () { window.open('https://rzp.io/rzp/zJ6jF8B', '_blank'); }, 1400);
  } else {
    toast('🛡️ ' + shields + ' shield' + (shields !== 1 ? 's' : '') + ' protect your streak if you miss a day', 'ok');
  }
}
