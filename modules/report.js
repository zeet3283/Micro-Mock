// ── WEEKLY PREPARATION REPORT ──

async function renderReport() {
  go('rp');
  var el = document.getElementById('rp');
  var isPro = P && (P.plan === 'pro' || (P.trial_ends_at && new Date(P.trial_ends_at) > new Date()));
  var seed  = U ? U.id : 'user';

  el.innerHTML =
    '<div class="nav">'
    + '<button onclick="renderPF()" style="background:none;border:none;color:var(--t3);font-size:14px;cursor:pointer;font-weight:700;font-family:inherit;display:flex;align-items:center;gap:5px">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back</button>'
    + '<div style="font-size:15px;font-weight:800">Prep Report</div>'
    + '<div style="width:40px"></div>'
    + '</div>'
    + '<div class="rp-body">'
    + '<div id="rp-content"><div style="text-align:center;padding:60px 20px;color:var(--t3);font-size:13px">Generating your report...</div></div>'
    + '</div>'
    + bnav('pf');

  if (!isPro) {
    document.getElementById('rp-content').innerHTML =
      '<div class="rp-locked">'
      + '<div style="font-size:52px;margin-bottom:14px">📊</div>'
      + '<div style="font-size:19px;font-weight:900;margin-bottom:10px;color:#C4B5FD">Weekly Prep Report</div>'
      + '<div style="font-size:13px;color:var(--t2);line-height:1.8;margin-bottom:24px;max-width:270px;margin-left:auto;margin-right:auto">'
      + 'Your weekly performance summary — accuracy trends, streak progress, subject breakdown — compiled every Monday. Something real to show your family.'
      + '</div>'
      + '<div class="rp-preview-blur">'
      + buildReportHTML({ name:'You', exam:'UPSC', weekLabel:'This Week', quizzes:7, accuracy:68, streak:5, prevAccuracy:54, strongest:'Polity', weakest:'Economy', rank:24, totalUsers:180 }, seed, true)
      + '</div>'
      + '<button class="btn btn-trial" style="margin-top:20px" onclick="window.open(\'https://rzp.io/rzp/zJ6jF8B\',\'_blank\')">Unlock Prep Reports — ₹149/month</button>'
      + '</div>';
    return;
  }

  var attempts = await api('user_attempts', '?user_id=eq.' + U.id + '&order=attempted_at.desc&limit=100');
  if (!attempts || attempts.length < 3) {
    document.getElementById('rp-content').innerHTML =
      '<div style="text-align:center;padding:60px 20px">'
      + '<div style="font-size:40px;margin-bottom:14px">📝</div>'
      + '<div style="font-size:16px;font-weight:800;margin-bottom:8px">Not enough data yet</div>'
      + '<div style="font-size:13px;color:var(--t3)">Complete a few more quizzes to generate your first report.</div>'
      + '</div>';
    return;
  }

  var now = new Date();
  var weekStart = new Date(now); weekStart.setDate(now.getDate() - 7); weekStart.setHours(0,0,0,0);
  var prevStart = new Date(weekStart); prevStart.setDate(weekStart.getDate() - 7);

  var thisWeek = attempts.filter(function(a){ return new Date(a.attempted_at || a.created_at) >= weekStart; });
  var prevWeek = attempts.filter(function(a){ var d = new Date(a.attempted_at || a.created_at); return d >= prevStart && d < weekStart; });

  var calcAcc = function(arr) {
    if (!arr.length) return 0;
    return Math.round(arr.reduce(function(s,a){ return s + parseFloat(a.accuracy_pct||0); },0) / arr.length);
  };

  var thisAcc = calcAcc(thisWeek);
  var prevAcc = calcAcc(prevWeek);

  // Subject breakdown
  var subMap = {};
  thisWeek.forEach(function(a){
    var sub = a.subject || 'General';
    if (!subMap[sub]) subMap[sub] = { total:0, acc:0 };
    subMap[sub].total++;
    subMap[sub].acc += parseFloat(a.accuracy_pct||0);
  });
  var subjects = Object.keys(subMap).map(function(s){ return { subject:s, accuracy: Math.round(subMap[s].acc/subMap[s].total) }; });
  subjects.sort(function(a,b){ return b.accuracy - a.accuracy; });

  var weekLabel = 'Week of ' + weekStart.toLocaleDateString('en-IN', { day:'numeric', month:'short' });

  var reportData = {
    name:        (P && P.name) || 'Aspirant',
    exam:        (P && P.exam_target) || 'UPSC',
    weekLabel:   weekLabel,
    quizzes:     thisWeek.length,
    accuracy:    thisAcc,
    prevAccuracy:prevAcc,
    streak:      parseInt(P.current_streak) || 0,
    strongest:   subjects.length ? subjects[0].subject : '—',
    weakest:     subjects.length ? subjects[subjects.length-1].subject : '—',
    rank:        null,
    totalUsers:  null
  };

  document.getElementById('rp-content').innerHTML =
    buildReportHTML(reportData, seed, false)
    + '<button class="btn btn-g" style="margin:16px 0 8px;gap:8px" onclick="shareReport()">'
    + '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
    + 'Share Report</button>';
}

function buildReportHTML(d, seed, isPreview) {
  var delta    = d.accuracy - d.prevAccuracy;
  var deltaStr = delta > 0 ? '↑ ' + delta + '% from last week' : delta < 0 ? '↓ ' + Math.abs(delta) + '% from last week' : 'Same as last week';
  var deltaCol = delta > 0 ? '#6EE7B7' : delta < 0 ? '#FDA4AF' : '#94A3B8';
  var readiness= Math.min(d.accuracy, 100);

  return '<div class="rp-card' + (isPreview ? ' rp-preview' : '') + '">'
    + '<div class="rp-header">'
    + '<div class="rp-logo">' + LOGO_SVG + '<span>Micro Mock</span></div>'
    + '<div class="rp-week-label">' + esc(d.weekLabel) + '</div>'
    + '</div>'
    + '<div class="rp-profile">'
    + '<div class="rp-av"><img src="' + avUrl(seed) + '" alt=""/></div>'
    + '<div>'
    + '<div class="rp-name">' + esc(d.name) + '</div>'
    + '<div class="rp-exam">Preparing for ' + esc(d.exam) + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="rp-divider"></div>'
    + '<div class="rp-stats-grid">'
    + rpStat(String(d.quizzes), 'Quizzes', '#6366F1')
    + rpStat(d.accuracy + '%', 'Accuracy', d.accuracy>=70?'#10B981':d.accuracy>=50?'#F59E0B':'#F43F5E')
    + rpStat(d.streak + 'd', 'Streak', '#F59E0B')
    + '</div>'
    + '<div class="rp-delta" style="color:' + deltaCol + '">' + deltaStr + '</div>'
    + '<div class="rp-bars">'
    + rpBar('Accuracy', d.accuracy, 'linear-gradient(90deg,#6366F1,#22D3EE)')
    + rpBar('Readiness', readiness, 'linear-gradient(90deg,#10B981,#22D3EE)')
    + '</div>'
    + '<div class="rp-subjects">'
    + '<div class="rp-subj-row"><span class="rp-subj-lbl">💪 Strongest</span><span class="rp-subj-val">' + esc(d.strongest) + '</span></div>'
    + '<div class="rp-subj-row"><span class="rp-subj-lbl">⚠️ Needs Work</span><span class="rp-subj-val" style="color:#FDA4AF">' + esc(d.weakest) + '</span></div>'
    + '</div>'
    + '<div class="rp-footer">'
    + '<span style="font-weight:700;font-size:11px;color:var(--t3)">micro-mock.in</span>'
    + '<div class="rp-ready-badge">' + readiness + '% Ready</div>'
    + '</div>'
    + '</div>';
}

function rpStat(val, lbl, color) {
  return '<div class="rp-stat">'
    + '<div class="rp-stat-val" style="color:' + color + '">' + esc(val) + '</div>'
    + '<div class="rp-stat-lbl">' + esc(lbl) + '</div>'
    + '</div>';
}

function rpBar(label, pct, gradient) {
  return '<div class="rp-bar-row">'
    + '<div class="rp-bar-hd"><span>' + esc(label) + '</span><span style="color:var(--cyan);font-weight:700">' + pct + '%</span></div>'
    + '<div class="rp-bar-bg"><div class="rp-bar-fg" style="width:' + pct + '%;background:' + gradient + '"></div></div>'
    + '</div>';
}

function shareReport() {
  var txt = '📊 My Micro Mock Weekly Prep Report\n\nAccuracy: ' + ((P&&P.xp)?'improving':'tracking') + '\nStreak: ' + (parseInt((P&&P.current_streak)||0)) + ' days\n\nPreparing daily for ' + ((P&&P.exam_target)||'UPSC') + ' 💪\n\nhttps://zeet3283.github.io/Micro-Mock/';
  if (navigator.share) navigator.share({ title: 'My Prep Report', text: txt });
  else { navigator.clipboard.writeText(txt).catch(function(){}); toast('Report copied! Share anywhere 📤', 'ok'); }
}
